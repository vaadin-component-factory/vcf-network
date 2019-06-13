import styleModule from './style-module';

export const colorVars = [
  '--vcf-network-red',
  '--vcf-network-orange',
  '--vcf-network-yellow',
  '--vcf-network-green',
  '--vcf-network-dark-green',
  '--vcf-network-blue',
  '--vcf-network-purple',
  '--vcf-network-violet',
  '--vcf-network-brown'
];

export const colorValues = [
  '#d0021c',
  '#f5a623',
  '#f8e81d',
  '#7dd421',
  '#417506',
  '#8a562b',
  '#4990e2',
  '#9013fe',
  '#bd10e0'
];

export const colors = () => {
  styleModule({
    themeName: 'vcf-network-colors',
    styles: `
      :host {
      ${colorVars.map((c, i) => `  ${c}: ${colorValues[i]};\n`).join('')}
      }
    `
  });
};
