import xweinre from 'xweinre';

export default {
  inject(app) {
    app.use(xweinre.inject());
  },
};
