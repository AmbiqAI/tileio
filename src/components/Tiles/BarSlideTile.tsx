import { observer } from "mobx-react-lite";
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

export const BarSlideTileSpec: TileSpec = {
  type: "BAR_SLIDE_TILE",
  name: "Bar Slide Tile",
  description: "Display static bar plots",
  streamingRequired: false,
  sizes: ["sm", "md", "lg"],
  schema: {
    type: 'object',
    required: ['name', 'duration', 'slides'],
    properties: {
      name: {
        type: 'string',
        default: 'Bar Slide'
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
        items: {
          type: 'object',
          required: ['name', 'bars'],
          properties: {
            name: {
              type: 'string',
              default: 'Slide'
            },
            bars: {
              type: 'array',
              minItems: 1,
              maxItems: 3,
              items: {
                type: 'object',
                required: ['name', 'value', 'color'],
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
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  uischema: {
    "name": {
      "ui:autocomplete": "off"
    },
    "slides": {
      "items": {
        "bars": {
          "items": {
            "color": {
              "ui:widget": "color"
            }
          }
        }
      }
    },
  }
};

export interface BarSlideConfig {
  name: string;
  bars: {name: string, value: number, color: string, label?: string}[];
}

export interface BarSlideTileConfig {
  name: string;
  duration: number,
  slides: BarSlideConfig[];
}

const BarSlide = ({ name, bars }: BarSlideConfig) => {
  const theme = useTheme();
  const chartEl = useRef<Chart<"bar">>(null);
  const data = useMemo<ChartData<"bar">>(() => ({
    labels: bars.map((bar) => bar.name),
    datasets: [{
      data: bars.map((bar) => bar.value),
      backgroundColor: bars.map((bar) => bar.color),
      borderColor: bars.map((bar) => bar.color),
      borderWidth: 1,
    }],
  }), []);

  const options = useMemo<ChartOptions<"bar">>(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        text: name,
        display: true,
        color: theme.palette.text.primary,
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: {
          bottom: 0
        }
      },
      annotation: {
        annotations: bars.map((bar) => ({
          type: 'label',
          content: [bar.label || `${bar.value}`],
          xValue: bar.value,
          yValue: bar.name,
          position: {
            x: 'end',
            y: 'center'
          },
          font: {
            size: 12,
            weight: 'bold',
          },
        })),
      }
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          padding: 1,
          color: theme.palette.text.primary,
          align: 'start',
          crossAlign: 'center',
          minRotation: 90,
          maxRotation: 90,
          font: {
            size: 12,
            weight: 'bold',
          },
        },

      }
    }
  }), []);

  return <Bar ref={chartEl} data={data} options={options} />;
}

const BarSlideTile = observer(({ config }: TileProps) => {
  const configs = config as BarSlideTileConfig;
  return (
    <GridContainer>
      <GridZStack level={2} style={{ margin: "4px 12px 12px 12px" }}>
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
          <BarSlide name={slide.name} bars={slide.bars} />
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
          pr: 0.5,
          pb: 0.5,
        }}
      >
        <Typography fontWeight={700} variant="h5" sx={{ lineHeight: 1 }}>
          {configs.name}
        </Typography>
      </Stack>
    </GridZStack>

      </GridContainer>
  );
});

export default BarSlideTile;
