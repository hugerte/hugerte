import * as Outlaw from "hugerte/porkbun/demo/Outlaw";
import * as Saloon from "hugerte/porkbun/demo/Saloon";
import * as Sheriff from "hugerte/porkbun/demo/Sheriff";

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
