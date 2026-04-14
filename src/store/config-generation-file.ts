import { ApplicationState } from './application/state';
import { ConnectionStateObject } from './connection/state';
import { ControllerStateObject } from './controllers/state';
import { EntityStateObject } from './entities/state';

interface ConfigGenerationFile extends ApplicationState, ConnectionStateObject, EntityStateObject, ControllerStateObject {
    api_definition: string,
    async_api_definition: string,
    async_api: any,
}

export default ConfigGenerationFile;
