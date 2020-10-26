declare module '*.pug' {
  import { compileTemplate } from 'pug';

  const content: compileTemplate;
  export = content;
}
