import { SugarElement } from 'hugemce/sugar/api/node/SugarElement';

export default (): SugarElement<HTMLElement> => SugarElement.fromHtml<HTMLElement>('<math xmlns="http://www.w3.org/1998/Math/MathML"></math>');
