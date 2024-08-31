import * as Outlaw from 'hugemce/porkbun/demo/Outlaw';
import * as Saloon from 'hugemce/porkbun/demo/Saloon';
import * as Sheriff from 'hugemce/porkbun/demo/Sheriff';

declare const $: any;

const saloon = Saloon.create();

const sheriff = Sheriff.create();

sheriff.watch(saloon);

const fred = Outlaw.create('Fred');
const barney = Outlaw.create('Barney');

fred.addAction('Shoot Barney', () => {
  fred.shoot(barney);
});

barney.addAction('Shoot Fred', () => {
  barney.shoot(fred);
});

fred.enter(saloon);
barney.enter(saloon);

$('body').append(sheriff.getElement());
$('body').append(saloon.getElement());
