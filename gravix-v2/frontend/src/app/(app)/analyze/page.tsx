'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MATERIAL_CATEGORIES, ADHESIVE_SUBCATEGORIES, FAILURE_MODES, COMMON_SUBSTRATES, TIME_TO_FAILURE_OPTIONS, HUMIDITY_OPTIONS, APPLICATION_METHODS } from '@/lib/constants';
import { FailureAnalysisFormData } from '@/lib/types';
import { api } from '@/lib/api';
import { AlertCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

export default function AnalyzePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FailureAnalysisFormData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: string, value: string | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.materialCategory && formData.materialSubcategory;
      case 2:
        return formData.failureMode && formData.failureDescription;
      case 3:
        return formData.substrateA && formData.substrateB;
      case 4:
        return true; // Optional fields
      case 5:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const analysis = await api.createFailureAnalysis(formData as any);
      router.push(`/analyze/${analysis.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create analysis');
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Failure Analysis</h1>
        <p className="text-muted-foreground">
          Get AI-powered root cause analysis for your adhesive, sealant, or coating failure
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Material Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-4">Material Information</CardTitle>
                <CardDescription>
                  Tell us about the material that failed
                </CardDescription>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Material Category</Label>
                  <RadioGroup
                    value={formData.materialCategory}
                    onValueChange={(value) => updateFormData('materialCategory', value)}
                  >
                    {MATERIAL_CATEGORIES.map((cat) => (
                      <div key={cat.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={cat.value} id={cat.value} />
                        <Label htmlFor={cat.value} className="font-normal cursor-pointer">
                          {cat.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {formData.materialCategory === 'adhesive' && (
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Adhesive Type</Label>
                    <Select
                      value={formData.materialSubcategory}
                      onValueChange={(value) => updateFormData('materialSubcategory', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ADHESIVE_SUBCATEGORIES.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="product">Product Name (optional)</Label>
                  <Input
                    id="product"
                    placeholder="e.g., Loctite 401, 3M 2216"
                    value={formData.materialProduct || ''}
                    onChange={(e) => updateFormData('materialProduct', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Failure Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-4">Failure Details</CardTitle>
                <CardDescription>
                  Describe what happened
                </CardDescription>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="failureMode">Failure Mode</Label>
                  <Select
                    value={formData.failureMode}
                    onValueChange={(value) => updateFormData('failureMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select failure mode..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FAILURE_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Failure Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the failure in detail... What happened? Where did it fail? What does it look like?"
                    rows={6}
                    value={formData.failureDescription || ''}
                    onChange={(e) => updateFormData('failureDescription', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    The more detail, the better the analysis. Minimum 100 characters.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeToFailure">Time to Failure</Label>
                  <Select
                    value={formData.timeToFailure}
                    onValueChange={(value) => updateFormData('timeToFailure', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_TO_FAILURE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Substrates & Environment */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-4">Substrates & Environment</CardTitle>
                <CardDescription>
                  What materials were bonded and under what conditions?
                </CardDescription>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="substrateA">Substrate A</Label>
                  <Select
                    value={formData.substrateA}
                    onValueChange={(value) => updateFormData('substrateA', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select substrate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_SUBSTRATES.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="substrateB">Substrate B</Label>
                  <Select
                    value={formData.substrateB}
                    onValueChange={(value) => updateFormData('substrateB', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select substrate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_SUBSTRATES.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature Range</Label>
                  <Input
                    id="temperature"
                    placeholder="e.g., -20°C to 80°C"
                    value={formData.temperatureRange || ''}
                    onChange={(e) => updateFormData('temperatureRange', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity</Label>
                  <Select
                    value={formData.humidity}
                    onValueChange={(value) => updateFormData('humidity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select humidity level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {HUMIDITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chemicals">Chemical Exposure (optional)</Label>
                  <Input
                    id="chemicals"
                    placeholder="e.g., gasoline, isopropyl alcohol"
                    value={formData.chemicalExposure || ''}
                    onChange={(e) => updateFormData('chemicalExposure', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Application Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-4">Application Details (Optional)</CardTitle>
                <CardDescription>
                  Additional context to improve analysis accuracy
                </CardDescription>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationMethod">Application Method</Label>
                  <Select
                    value={formData.applicationMethod}
                    onValueChange={(value) => updateFormData('applicationMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method..." />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surfacePrep">Surface Preparation</Label>
                  <Textarea
                    id="surfacePrep"
                    placeholder="How were surfaces prepared before bonding?"
                    rows={3}
                    value={formData.surfacePreparation || ''}
                    onChange={(e) => updateFormData('surfacePreparation', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cureConditions">Cure Conditions</Label>
                  <Textarea
                    id="cureConditions"
                    placeholder="Temperature, time, method..."
                    rows={3}
                    value={formData.cureConditions || ''}
                    onChange={(e) => updateFormData('cureConditions', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-4">Review & Submit</CardTitle>
                <CardDescription>
                  Please review your information before submitting
                </CardDescription>
              </div>

              <div className="space-y-4 text-sm">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Material</h4>
                  <p className="text-muted-foreground">
                    {formData.materialCategory} — {formData.materialSubcategory}
                    {formData.materialProduct && ` (${formData.materialProduct})`}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Failure</h4>
                  <p className="text-muted-foreground mb-2">{formData.failureMode}</p>
                  <p className="text-muted-foreground text-xs">{formData.failureDescription}</p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Substrates</h4>
                  <p className="text-muted-foreground">
                    {formData.substrateA} to {formData.substrateB}
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Environment</h4>
                  <ul className="text-muted-foreground space-y-1">
                    {formData.temperatureRange && (
                      <li>Temperature: {formData.temperatureRange}</li>
                    )}
                    {formData.humidity && <li>Humidity: {formData.humidity}</li>}
                    {formData.timeToFailure && (
                      <li>Time to failure: {formData.timeToFailure}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Submit Analysis'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
