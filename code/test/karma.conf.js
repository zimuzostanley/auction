module.exports = function(config){
    config.set({

	basePath : '../',

	files : [
	    'app/bower_components/angular/angular.js',
	    'app/bower_components/angular-resource/angular-resource.js',
	    'app/bower_components/angular-ui-router/release/angular-ui-router.js',
	    'app/bower_components/angular-mocks/angular-mocks.js',
	    'app/js/**/*.js',
	    'test/unit/frontend/**/*.js'
	],

	autoWatch : true,

	frameworks: ['mocha', 'sinon', 'should'],

	browsers : ['Chrome', 'Firefox'],

	plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-mocha',
	    'karma-sinon',
	    'karma-should'
        ],

	junitReporter : {
	    outputFile: 'test_out/unit.xml',
	    suite: 'unit'
	}

    });
};
