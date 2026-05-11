# Cron timeout headroom watchlist

Generated: 2026-04-19 23:02:52 PDT

## Summary

- **jobs scanned:** 13
- **critical:** 1
- **high:** 0
- **medium:** 0
- **patches ready:** 1

## Jobs

### moneysamurai-sync-trigger
- job id: `c6565127-2875-4a1d-be8f-1c0021dd0ade`
- risk: **critical**
- last status: `error`
- last duration: `60063` ms
- timeout: `60` s
- budget used: `100%`
- proposed timeout: `120` s
- last error: `cron: job execution timed out`
- note: Latest run failed due to timeout.
- patch:
```json
{
  "jobId": "c6565127-2875-4a1d-be8f-1c0021dd0ade",
  "patch": {
    "payload": {
      "timeoutSeconds": 120
    }
  }
}
```

### service-health-monitor
- job id: `7fcc3d6b-1236-4a3a-9a9a-26af5bc179e6`
- risk: **ok**
- last status: `ok`
- last duration: `29353` ms
- timeout: `60` s
- budget used: `49%`
- proposed timeout: `60` s
- note: Latest run has comfortable timeout headroom.

### ads-daily-pull
- job id: `05a6e66b-d1df-46af-b164-4e55cbb6bb9f`
- risk: **ok**
- last status: `ok`
- last duration: `686647` ms
- timeout: `1800` s
- budget used: `38%`
- proposed timeout: `1800` s
- note: Latest run has comfortable timeout headroom.

### moneysamurai-keep-alive
- job id: `c5e436d0-65c5-4f57-a9b0-6c2b40b921af`
- risk: **ok**
- last status: `ok`
- last duration: `10330` ms
- timeout: `30` s
- budget used: `34%`
- proposed timeout: `30` s
- note: Latest run has comfortable timeout headroom.

### gravix-aggregate-knowledge
- job id: `4b6e8fa4-c145-4a72-9496-74ebfb9a0683`
- risk: **ok**
- last status: `ok`
- last duration: `19972` ms
- timeout: `60` s
- budget used: `33%`
- proposed timeout: `60` s
- note: Latest run has comfortable timeout headroom.

### gravix-send-followups
- job id: `47169cc0-9df9-4539-bdec-60405109e017`
- risk: **ok**
- last status: `ok`
- last duration: `12539` ms
- timeout: `60` s
- budget used: `21%`
- proposed timeout: `60` s
- note: Latest run has comfortable timeout headroom.

### evgueni-email-monitor
- job id: `08054f94-6178-4f45-83b2-348ab56cda17`
- risk: **ok**
- last status: `ok`
- last duration: `22286` ms
- timeout: `120` s
- budget used: `19%`
- proposed timeout: `120` s
- note: Latest run has comfortable timeout headroom.

### ads-weekly-report
- job id: `d94e9f6f-458c-44d5-993c-02e6b0930c50`
- risk: **ok**
- last status: `ok`
- last duration: `34263` ms
- timeout: `300` s
- budget used: `11%`
- proposed timeout: `300` s
- note: Latest run has comfortable timeout headroom.

### sales-email-monitor
- job id: `280c5ddc-93ca-4011-980e-4740a51a4eb5`
- risk: **ok**
- last status: `ok`
- last duration: `12949` ms
- timeout: `120` s
- budget used: `11%`
- proposed timeout: `120` s
- note: Latest run has comfortable timeout headroom.

### Nightly build (autonomous)
- job id: `0c669322-d126-42b6-9647-81a4929ad148`
- risk: **unknown**
- last status: `ok`
- last duration: `320149` ms
- timeout: `None` s
- budget used: `n/a`
- proposed timeout: `None` s
- note: No explicit timeoutSeconds set.

### Morning briefing
- job id: `00045a1b-65ab-446d-b8a7-f888398b9d9a`
- risk: **unknown**
- last status: `ok`
- last duration: `37449` ms
- timeout: `None` s
- budget used: `n/a`
- proposed timeout: `None` s
- note: No explicit timeoutSeconds set.

### Midday check
- job id: `ccee3f89-b7f3-444e-a878-445ab6644d98`
- risk: **unknown**
- last status: `ok`
- last duration: `16531` ms
- timeout: `None` s
- budget used: `n/a`
- proposed timeout: `None` s
- note: No explicit timeoutSeconds set.

### EOD summary
- job id: `c45a8e68-2f60-4d79-bfb8-35be1b4e1ac5`
- risk: **unknown**
- last status: `ok`
- last duration: `51799` ms
- timeout: `None` s
- budget used: `n/a`
- proposed timeout: `None` s
- note: No explicit timeoutSeconds set.
