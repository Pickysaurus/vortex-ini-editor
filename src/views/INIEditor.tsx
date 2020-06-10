import { ComponentEx } from 'vortex-api';

export interface IBaseProps {
    shown: boolean;
    onHide: () => void;
}
  
interface IComponentState {
    selectedLicense: string;
    licenseText: string;
    ownLicense: boolean;
    releaseDate: Date;
    changelog: string;
    tag: string;
}
  
type IProps = IBaseProps;

class INIEditor extends ComponentEx<IProps, IComponentState> {
    render() {
        return 'INI Editor Page';
    }
}

export default INIEditor;