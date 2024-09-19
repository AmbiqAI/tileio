import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material";
import { availableDashboards } from "../../assets/dashboards";


interface Props {
  dashboard: string;
  setDashboard: (dashboard: string) => void;
}

const BuiltDashboardSelectForm = ({ dashboard, setDashboard }: Props) => {
  const options = availableDashboards;

  return (
    <FormControl sx={{ mx: 1, minWidth: 180 }} size="small" color="primary">
      <InputLabel id="demo-simple-select-helper-label">Built-in Dashboard</InputLabel>
      <Select
        color="primary"
        labelId="demo-simple-select-helper-label"
        id="demo-simple-select-helper"
        value={dashboard}
        label="Built-in Dashboard"
        inputProps={{
          color: 'primary'
        }}
        onChange={(e) => {
          setDashboard(e.target.value as string);
        }}
        MenuProps={{
          color: 'primary'
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {options.map((option) => (
          <MenuItem color="primary" key={option.file} value={option.file}>{option.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default BuiltDashboardSelectForm;
