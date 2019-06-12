import styleModule from './style-module';

export const colorVars = [
  '--vcf-hn-red',
  '--vcf-hn-orange',
  '--vcf-hn-yellow',
  '--vcf-hn-green',
  '--vcf-hn-dark-green',
  '--vcf-hn-blue',
  '--vcf-hn-purple',
  '--vcf-hn-violet',
  '--vcf-hn-brown'
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
