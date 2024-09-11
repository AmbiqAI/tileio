import { VisuallyHiddenInput } from "./VisuallyHiddenInput";

interface Props {
  onSubmit: (json: any) => void;
  onError?: (error: Error) => void;
}


const JsonUploadInput = ({ onSubmit, onError }: Props) => {
  return (
    <VisuallyHiddenInput
      onClick={(e) => {
        e.currentTarget.value = "";
      }}
      onChange={(e) => {
        try {
          if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const text = e.target?.result;
                if (typeof text === 'string') {
                  const json = JSON.parse(text);
                  onSubmit(json);
                }
              } catch (error) {
                if (onError) {
                  onError(error as Error);
                }
              }
            };
            reader.readAsText(file);
          }
        } catch (error) {
          if (onError) {
            onError(error as Error);
          }
        }
      }}
      type="file"
      accept="application/json"
    />
  )
}

export default JsonUploadInput;
