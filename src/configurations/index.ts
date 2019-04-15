import * as _ from 'lodash';
import configurations from '../configurations/configurations';

export default {
    env: process.env.NODE_ENV,
    // Server port
    port: process.env.PORT || _.get(configurations, 'default.port', _.get(configurations, 'port', null)),
    apps: {
        goliath: _.get(configurations, 'default.goliathUrl', _.get(configurations, 'goliathUrl', null))
    }
};
