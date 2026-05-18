import fs from 'fs';
import { parse } from '@vue/compiler-sfc';

const content = fs.readFileSync('app/components/features/messages/Chat.vue', 'utf-8');

const { descriptor, errors } = parse(content);

if (errors.length) {
  console.log("Errors found:");
  errors.forEach(e => {
    console.log(e.message, e.loc);
  });
} else {
  console.log("No syntax errors found by compiler-sfc.");
}
