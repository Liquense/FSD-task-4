import { importContext } from '../utils/functions';

importContext(require.context('./', true, /\.(svg|png|ico|xml|json|webmanifest)$/));
