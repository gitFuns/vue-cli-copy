var async = require('async')
var inquirer = require('inquirer')

inquirer
  .prompt([{
    type: 'string',
    name: 'uname',
    message: 'input your name'
  }])
  .then()
