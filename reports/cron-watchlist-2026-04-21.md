# Cron timeout headroom watchlist

Generated: 2026-04-20 23:03:02 PDT

## Summary

- **jobs scanned:** 13
- **critical:** 1
- **high:** 0
- **medium:** 1
- **patches ready:** 3

## Jobs

### gravix-aggregate-knowledge
- job id: `4b6e8fa4-c145-4a72-9496-74ebfb9a0683`
- risk: **critical**
- last status: `error`
- last duration: `60067` ms
- timeout: `60` s
- budget used: `100%`
- proposed timeout: `120` s
- last error: `cron: job execution timed out`
- note: Latest run failed due to timeout.
- patch:
```json
{
  "jobId": "4b6e8fa4-c145-4a72-9496-74ebfb9a0683",
  "patch": {
    "payload": {
      "timeoutSeconds": 120
    }
  }
}
```

### ads-daily-pull
- job id: `05a6e66b-d1df-46af-b164-4e55cbb6bb9f`
- risk: **medium**
- last status: `error`
- last duration: `1368469` ms
- timeout: `1800` s
- budget used: `76%`
- proposed timeout: `2400` s
- last error: `⚠️ ✉️ Message failed`
- note: Latest run used 76% of the timeout budget.
- patch:
```json
{
  "jobId": "05a6e66b-d1df-46af-b164-4e55cbb6bb9f",
  "patch": {
    "payload": {
      "timeoutSeconds": 2400
    }
  }
}
```

### moneysamurai-keep-alive
- job id: `c5e436d0-65c5-4f57-a9b0-6c2b40b921af`
- risk: **ok**
- last status: `ok`
- last duration: `13087` ms
- timeout: `30` s
- budget used: `44%`
- proposed timeout: `30` s
- note: Latest run has comfortable timeout headroom.

### gravix-send-followups
- job id: `47169cc0-9df9-4539-bdec-60405109e017`
- risk: **ok**
- last status: `ok`
- last duration: `23272` ms
- timeout: `60` s
- budget used: `39%`
- proposed timeout: `60` s
- note: Latest run has comfortable timeout headroom.

### evgueni-email-monitor
- job id: `08054f94-6178-4f45-83b2-348ab56cda17`
- risk: **ok**
- last status: `ok`
- last duration: `38580` ms
- timeout: `120` s
- budget used: `32%`
- proposed timeout: `120` s
- note: Latest run has comfortable timeout headroom.

### ads-weekly-report
- job id: `d94e9f6f-458c-44d5-993c-02e6b0930c50`
- risk: **ok**
- last status: `error`
- last duration: `86886` ms
- timeout: `300` s
- budget used: `29%`
- proposed timeout: `330` s
- last error: `⚠️ ✉️ Message failed`
- note: Latest run has comfortable timeout headroom.
- patch:
```json
{
  "jobId": "d94e9f6f-458c-44d5-993c-02e6b0930c50",
  "patch": {
    "payload": {
      "timeoutSeconds": 330
    }
  }
}
```

### sales-email-monitor
- job id: `280c5ddc-93ca-4011-980e-4740a51a4eb5`
- risk: **ok**
- last status: `ok`
- last duration: `30128` ms
- timeout: `120` s
- budget used: `25%`
- proposed timeout: `120` s
- note: Latest run has comfortable timeout headroom.

### moneysamurai-sync-trigger
- job id: `c6565127-2875-4a1d-be8f-1c0021dd0ade`
- risk: **ok**
- last status: `ok`
- last duration: `29633` ms
- timeout: `120` s
- budget used: `25%`
- proposed timeout: `120` s
- note: Latest run has comfortable timeout headroom.

### service-health-monitor
- job id: `7fcc3d6b-1236-4a3a-9a9a-26af5bc179e6`
- risk: **ok**
- last status: `ok`
- last duration: `11971` ms
- timeout: `60` s
- budget used: `20%`
- proposed timeout: `60` s
- note: Latest run has comfortable timeout headroom.

### Nightly build (autonomous)
- job id: `0c669322-d126-42b6-9647-81a4929ad148`
- risk: **unknown**
- last status: `ok`
- last duration: `234094` ms
- timeout: `None` s
- budget used: `n/a`
- proposed timeout: `None` s
- note: No explicit timeoutSeconds set.

### Morning briefing
- job id: `00045a1b-65ab-446d-b8a7-f888398b9d9a`
- risk: **unknown**
- last status: `ok`
- last duration: `37817` ms
- timeout: `None` s
- budget used: `n/a`
- proposed timeout: `None` s
- note: No explicit timeoutSeconds set.

### Midday check
- job id: `ccee3f89-b7f3-444e-a878-445ab6644d98`
- risk: **unknown**
- last status: `ok`
- last duration: `68784` ms
- timeout: `None` s
- budget used: `n/a`
- proposed timeout: `None` s
- note: No explicit timeoutSeconds set.

### EOD summary
- job id: `c45a8e68-2f60-4d79-bfb8-35be1b4e1ac5`
- risk: **unknown**
- last status: `ok`
- last duration: `41980` ms
- timeout: `None` s
- budget used: `n/a`
- proposed timeout: `None` s
- note: No explicit timeoutSeconds set.
