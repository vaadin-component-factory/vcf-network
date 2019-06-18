import styleModule from './style-module';

export const colorVars = [
  { name: '--vcf-network-red', value: 'rgb(208,2,28)' },
  { name: '--vcf-network-orange', value: 'rgb(245,166,35)' },
  { name: '--vcf-network-yellow', value: 'rgb(248,232,29)' },
  { name: '--vcf-network-green', value: 'rgb(125,212,33)' },
  { name: '--vcf-network-dark-green', value: 'rgb(65,117,6)' },
  { name: '--vcf-network-blue', value: 'rgb(73,144,226)' },
  { name: '--vcf-network-purple', value: 'rgb(144,19,254)' },
  { name: '--vcf-network-violet', value: 'rgb(189,16,224)' },
  { name: '--vcf-network-brown', value: 'rgb(138,86,43)' }
];

export const colors = () => {
  styleModule({
    themeName: 'vcf-network-colors',
    styles: `
      :host {
      ${colorVars.map((c, i) => `  ${c.name}: ${c.value};\n`).join('')}
      }
    `
  });
};
