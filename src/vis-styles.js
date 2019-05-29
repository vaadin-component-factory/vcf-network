import {styleModule} from './util/style-module';

fetch('../bower_components/vis/dist/vis.css')
  .then(res => res.text())
  .then(styles => {
    styleModule({
      themeName: 'vis-styles',
      styles
    });
  });

