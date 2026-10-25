import { $, $$ } from './game';

/* Legenda e chamada numerada se iluminam juntas. */
$$<HTMLElement>('[data-callout]').forEach((li) => {
  const pin = () => $<HTMLElement>(`[data-pin="${li.dataset.callout}"]`);
  const on = () => {
    li.setAttribute('data-hot', '');
    pin()?.setAttribute('data-hot', '');
  };
  const off = () => {
    li.removeAttribute('data-hot');
    pin()?.removeAttribute('data-hot');
  };
  li.addEventListener('mouseenter', on);
  li.addEventListener('mouseleave', off);
  li.addEventListener('focus', on);
  li.addEventListener('blur', off);
});
