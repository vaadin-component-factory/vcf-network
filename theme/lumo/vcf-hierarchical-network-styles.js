import { styleModule } from '../../src/util/style-module';
import '@vaadin/vaadin-lumo-styles/color';
import '@vaadin/vaadin-lumo-styles/sizing';
import '@vaadin/vaadin-lumo-styles/spacing';
import '@vaadin/vaadin-lumo-styles/style';
import '@vaadin/vaadin-lumo-styles/typography';

styleModule({
  themeFor: 'vcf-hierarchical-network',
  themeName: 'vcf-hierarchical-network-lumo',
  include: 'lumo-color lumo-typography',
  styles: `
    :host {
      border: 1px solid var(--lumo-primary-color-50pct);
    }
  `
});
