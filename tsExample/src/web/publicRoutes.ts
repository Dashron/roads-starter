import * as fs from 'fs';
import Handlebars from 'handlebars';
import SimpleRouter from 'roads/types/middleware/simpleRouter';

let indexTemplate = fs.readFileSync(__dirname + '/../../templates/index.hbs').toString('utf-8');

export default function (router: SimpleRouter) {
    router.addRoute('GET', '/', async function (url, body, headers) {
        let pageData = {
            loggedIn: false
        };
        
        pageData.loggedIn = this.loggedIn;
        let indexPage = Handlebars.compile(indexTemplate);
        this.setTitle('Welcome Home');
        return new this.Response(indexPage(pageData), 200, {'content-type': 'text/html'});
    });
};