import { observer } from "mobx-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { TileProps, TileSpec } from "./BaseTile";
import { GridContainer, GridZStack } from "./utils";
import { Stack, Typography } from "@mui/material";
import { useMemo, useRef } from "react";
import { Chart, ChartData, ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTheme } from '@mui/system';
import { ThemeColors } from "../../theme/theme";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { AnnotationOptions } from "chartjs-plugin-annotation";

export const ChartSlideSchema: RJSFSchema = {
  type: 'object',
  required: ['name', 'type', 'values'],
  properties: {
    name: {
      type: 'string',
      title: 'Slide Name',
      default: 'Slide'
    },
    type: {
      type: 'string',
      enum: ['bar', 'number'],
      default: 'bar',
      description: 'Chart Type'
    },
    values: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      items: {
        type: 'object',
        required: ['name', 'value', 'color', 'location'],
        properties: {
          name: {
            type: 'string',
            default: 'Bar'
          },
          value: {
            type: 'number',
            default: 0
          },
          color: {
            type: 'string',
            default: ThemeColors.colors.primaryColor
          },
          label: {
            type: 'string',
            description: 'Label (e.g. 80 ms)'
          },
          location: {
            type: 'string',
            enum: ['inside', 'outside'],
            default: 'inside',
            description: 'Label location'
          }
        }
      }
    }
  }
};

export const BarSlideUiSchema: UiSchema = {
  "values": {
    "items": {
      "color": {
        "ui:widget": "color"
      }
    }
  }
};


export const BarSlideTileSpec: TileSpec = {
  type: "BAR_SLIDE_TILE",
  name: "Bar Slide Tile",
  description: "Display static bar plots",
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'duration', 'slides'],
    properties: {
      name: {
        type: 'string',
        default: 'Slides'
      },
      duration: {
        type: 'number',
        minimum: 1,
        maximum: 10,
        default: 5,
        description: 'Duration (sec)'
      },
      slides: {
        type: 'array',
        minItems: 1,
        maxItems: 5,
        items: ChartSlideSchema
      }
    }
  },
  uischema: {
    "name": {
      "ui:autocomplete": "off"
    },
    "slides": {
      "items": BarSlideUiSchema
    },
  }
};

export interface ChartSlideConfig {
  name: string;
  type: 'bar' | 'number';
  size: 'sm' | 'md' | 'lg';
  values: {name: string, value: number, color: string, label?: string, location?: string}[];
}

export interface ChartSlideTileConfig {
  name: string;
  duration: number,
  slides: ChartSlideConfig[];
}

export function parseConfig(config: { [key: string]: any }): ChartSlideTileConfig {
  const configs = {
    name: 'Slides',
    duration: 5,
    slides: [],
    ...config
  } as ChartSlideTileConfig;
  return configs;
}

const BarSlide = ({ name, values: bars }: ChartSlideConfig) => {
  const theme = useTheme();
  const chartEl = useRef<Chart<"bar">>(null);

  const data = useMemo<ChartData<"bar">>(() => ({
    labels: bars.map((bar, i) => bar.name),
    datasets: [{
        data: bars.map((bar) => bar.value),
        backgroundColor: bars.map((bar) => bar.color),
        borderColor: 'rgba(0,0,0,0)',
        borderWidth: 2,
        minBarLength: 16,
    }]
  }), [bars]);

  const options = useMemo<ChartOptions<"bar">>(() => {
    const annotations: AnnotationOptions<"label">[] = bars.map((bar) => ({
      type: 'label',
      content: [bar.label || `${bar.value}`],
      xValue: bar.value,
      yValue: bar.name,
      position: {
        x: bar.location === 'outside' ? 'start' : 'end',
        y: 'center'
      },
      color: theme.palette.text.primary,
      font: {
        size: 16,
        weight: 'bold',
      },
    }));

    const o: ChartOptions<"bar"> = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      elements: {
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: { enabled: false },
        title: {
          text: name,
          display: true,
          color: theme.palette.text.primary,
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        annotation: {
          annotations: annotations
        }
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          display: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0)',
            z: 2,
          },
          ticks: {
            display: true,
            align: 'center',
            padding: 8,
            labelOffset: -16,
            crossAlign: 'near',
            color: theme.palette.text.primary,
            minRotation: 90,
            maxRotation: 90,
            font: {
              weight: 'bold',
            },
          },
        }
      }
    }
    return o;
  }, [bars, name, theme]);

  return <Bar ref={chartEl} data={data} options={options} />;
}


const NumbersSlide = ({ name, values, size }: ChartSlideConfig) => {

  const labelVariant = size === 'sm' ? 'h6' : 'h5';
  const nameVariant = size === 'sm' ? 'body1' : 'h6';

  return (
    <>
    <GridZStack level={1}>
    <Stack
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="flex-start"
      padding={0}
      sx={{
        userSelect: "none",
        WebkitUserSelect: "none",
        textAlign: "end",
        pt: 1.2,
      }}
    >
      <Typography fontWeight={700} variant="subtitle1" sx={{ lineHeight: 1 }}>
        {name}
      </Typography>
    </Stack>
  </GridZStack>
  <GridZStack level={1}>
    <Stack
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      p={1}
      >
      <Grid container justifyContent="center" spacing={1} width="100%" height="100%" pb={4}>
        {values.map((value, idx) => (
        <Grid xs={4} key={`state-${idx}`}>
          <Stack
            direction="row"
            height="100%"
            justifyContent="center"
            alignItems="center"
            spacing={0}
          >
            <div
              style={{
                borderBottomStyle: "solid",
                borderBottomWidth: "4px",
                borderBottomColor: value.color,
              }}
            >
              <Typography variant={labelVariant} fontWeight={600}>
                {value.label || `${value.value}`}
              </Typography>
              <Typography color={ThemeColors.colors.secondaryColor} variant={nameVariant} fontWeight={600}>
                {value.name}
              </Typography>
            </div>
          </Stack>
        </Grid>
        ))}
      </Grid>
    </Stack>
  </GridZStack>
  </>
  )
}


const BarSlideTile = observer(({ size, config }: TileProps) => {
  const configs = useMemo(() => parseConfig(config || {}), [config]);

  return (
    <GridContainer>
      <GridZStack level={2}>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 1000*configs.duration,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: false,
          enabled: false,
        }}
        navigation={false}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
      >
      {configs.slides.map((slide, index) => (
        <SwiperSlide key={`slide-${slide.name}-${index}`}>
          {slide.type === 'number' && (
            <NumbersSlide name={slide.name} type={slide.type} values={slide.values} size={size} />
          )}
          {slide.type === 'bar' && (
            <BarSlide name={slide.name} type={slide.type} values={slide.values} size={size} />
          )}
        </SwiperSlide>
      ))}

      </Swiper>
      </GridZStack>

      <GridZStack level={1}>
      <Stack
        width="100%"
        height="100%"
        alignItems="flex-end"
        justifyContent="flex-end"
        padding={0}
        sx={{
          backgroundColor: "rgba(0,0,0,0)",
          userSelect: "none",
          WebkitUserSelect: "none",
          textAlign: "end",
          pr: 1.0,
          pb: 0.5,
        }}
      >
        <Typography
        fontWeight={700}
        color={ThemeColors.colors.secondaryColor}
        variant="h6" sx={{ lineHeight: 1 }}>
          {configs.name}
        </Typography>
      </Stack>
    </GridZStack>

      </GridContainer>
  );
});

export default BarSlideTile;
