// This file previously defined a different Salary schema which conflicted
// with the consolidated `salaryModel.js` (duplicate model name "Salary").
// To avoid model name collisions and ensure a single canonical schema is
// used across the backend, re-export the model exported by `salaryModel.js`.

import Salary from './salaryModel.js';

export default Salary;
