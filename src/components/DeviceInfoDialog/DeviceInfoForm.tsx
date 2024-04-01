import { observer } from "mobx-react";
import { Form } from "@rjsf/mui";
import validator from '@rjsf/validator-ajv8';
import { IDeviceInfo, DeviceInfoSchema } from "../../models/deviceInfo";

const DeviceInfoForm = ({ info, setInfo }: { info: IDeviceInfo, setInfo: (info: IDeviceInfo) => void }) => {
  return (
    <Form
    schema={DeviceInfoSchema.schema}
    uiSchema={DeviceInfoSchema.uischema}
    formData={info}
    validator={validator}
    onChange={(e) => setInfo(e.formData)}
    children={true}
  />
  )
};

export default observer(DeviceInfoForm);
