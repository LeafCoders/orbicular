const gulp = require('gulp');
const spawn = require('child_process').spawn;

/**
 * Gulp task to run `tsc --watch` and `polymer serve` in parallel.
 */
gulp.task('serve', () => {
  const spawnOptions = {
    shell: true,
    stdio: 'inherit'    
  };
  spawn('tsc', ['--watch'], spawnOptions);
  spawn('polymer', ['serve'], spawnOptions);
});
