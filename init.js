module.exports = {
  destination: {
    default(data) {
      return data.packageName;
    },
  },
  prompts: {
    packageHumanName: {
      message: "Human-readable Name (e.g., 'Intercom')",
      validate(val) {
        return true;
      },
    },
    packageName: {
      message: 'Package / GitHub project name',
      default(data) {
        return 'hull-' + data.packageHumanName.toLowerCase().replace(/ /, '-');
      },
      validate(val) {
        return (
          /^([a-z0-9]+-?)+$/.test(val.trim()) ||
          'Must be lower + dash-cased string'
        );
      },
    },
    packageGitHubOrg: {
      message: 'GitHub organization name',
      default(data) {
        return 'hull-ships';
      },
      validate(val) {
        return (
          /^([^\s])*$/.test(val) || 'Must be GitHub-valid organization username'
        );
      },
    },
    packageDescription: {
      message: 'Package description',
      default(data) {
        return `Synchronize Data with ${data.packageHumanName}`;
      },
    },
    licenseOrg: {
      message: 'License organization (e.g., you or your company)',
      default(data) {
        return data.packageGitHubOrg;
      },
      validate(val) {
        return !!val.trim() || 'Must enter a license organization';
      },
    },
  },

  // Derived fields are asynchronous functions that are given the previous user
  // input data of the form: `function (data, cb)`. They callback with:
  // `(err, value)`.
  derived: {},
};
