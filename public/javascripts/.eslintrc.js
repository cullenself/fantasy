module.exports = {
    "extends": "airbnb-base",
    "env": {
        "jquery": true
    },
    "globals": {
        "Mustache": true,
        "window": true
    },
    "rules": {
        "no-unused-vars": "warn",
        "no-param-reassign": [
            "error",
            {"props": false}
        ]
    }
};
