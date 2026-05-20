#!/bin/bash
set -e
echo "Running Pre-commit Checks"
npx tsc --noEmit
echo "Pre-commit Checks Passed"
