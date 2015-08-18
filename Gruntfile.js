module.exports = function( grunt ){

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				mangle:false,
				compress:true,
				preserveComments: 'all'
			}, 
			plugins: {
				files: {
					'js/script.min.js': ['js/script.js'],
					'js/plugins.min.js': ['js/plugins/*.js']
				}
			}
		}, 
		sass: {
			dist:{
				options: { 
					style: 'compressed'
				},
				files: {
					'css/styles.css': 'sass/styles.scss'
				}
			}
		},
		watch: {
			template: {
				files: ['*.html'],
			},
			sass: {
				files: ['sass/*.scss'],
				tasks: ['sass']
			},
			uglify: {
				files: ['js/plugins/*.js', 'js/script.js'],
				tasks: ['uglify:plugins']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', ['watch', 'uglify:plugins'])
}