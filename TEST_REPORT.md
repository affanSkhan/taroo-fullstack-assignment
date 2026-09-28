# Verification Report

## Automated CI result

Verified on GitHub Actions using Node.js 20.20.2 on Ubuntu 24.04.

- Test suites: **3 passed / 3 total**
- Tests: **43 passed / 43 total**
- Snapshots: **0**
- Coverage command: `jest --coverage --runInBand`

### Coverage

| Metric | Result |
|---|---:|
| Statements | **97.31%** |
| Branches | **92.64%** |
| Functions | **94.28%** |
| Lines | **97.60%** |

The configured global Jest threshold is 80% for statements, branches, functions and lines, so the verified run passes the threshold.

## CI workflow

The workflow installs dependencies, runs the complete Jest suite and runs the coverage command on pull requests and pushes to `main`.

## Notes

The verification run reported one moderate dependency vulnerability and deprecation warnings from older transitive dependencies. These did not cause test failure. The assignment's requested dependency stack was retained to minimize unrelated changes to the starter exercise.
