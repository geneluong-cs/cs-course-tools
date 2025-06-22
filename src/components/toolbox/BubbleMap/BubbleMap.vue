<script setup lang="ts">

import { ref } from 'vue';
import { Chart, type ChartConfiguration, Tooltip, PointElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BubbleMapController, topojson, GeoFeature, ColorScale, SizeScale, ProjectionScale } from 'chartjs-chart-geo';
import { convert, decodeCities, encodeCities, prettyPrintCity, type ICity } from './MapHelpers';
import { useRoute, useRouter } from 'vue-router';
import { getRouteName } from '@/router/RouterNames';
import { ModelSelect } from 'vue-search-select';

const bubbleMapCanvas = ref(null as any as HTMLCanvasElement);
// register controller in chart.js and ensure the defaults are set
Chart.register(BubbleMapController, GeoFeature, ColorScale, PointElement, Tooltip, SizeScale, ProjectionScale, ChartDataLabels);

const route = useRoute();
const router = useRouter();

const selectElement = ref(null as any as ModelSelect);

// https://github.com/topojson/world-atlas
const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then((r) => r.json());
const countries = (topojson.feature(world, world.objects.countries) as any).features;
const capitals = await fetch('https://gist.githubusercontent.com/geneluong-cs/77c6aa21faa8033780ac403cb1cb892e/raw/59d0143e477ad75dd5dc59424389a034ded37dc1/worldmap.json')
  .then(x => x.json())
  .then(y => y.map((x: any) => convert(x)));
const capitalOptions = ref(capitals.map((x: any) => { return { value: x, text: prettyPrintCity(x) } }));

const selectedCity = ref({} as { value: ICity, text: string });
const selectedCities = ref(new Array<ICity>());
const rendered = ref(false);

const queryData = route.query['data'] as string;

if (queryData) {
  selectedCities.value = decodeCities(queryData);
  updateUrl();
}

function addSelected(x: { text: string, value: ICity }): void {
  const city = x.value;
  if (city && selectedCities.value.findIndex(x => x.description == city.description) === -1) {
    selectedCities.value.push(city);
  }
}

function updateUrl(): void {
  const data = encodeCities(selectedCities.value);

  router.replace({
    name: getRouteName("bubble-map"),
    query: {
      data: data,
    }
  });

}

function renderMap(dataPoint: ICity[]) {
  rendered.value = true;
  updateUrl();

  const data: ChartConfiguration<'bubbleMap'>['data'] = {
    labels: dataPoint.map((x: any) => x.description || x.admin_name || x.name),
    datasets: [{
      outline: countries,
      showOutline: true,
      backgroundColor: 'steelblue',
      data: dataPoint
    }]
  };

  const options: ChartConfiguration<'bubbleMap'>['options'] = {
    plugins: {
      legend: {
        display: false
      },
      datalabels: {
        align: 'top',
        formatter: (v) => {
          if (v.admin_name && v.description !== v.admin_name) {
            return `${v.admin_name}/${v.description}`;
          } else {
            return v.description;
          }
        }
      },
      // @ts-expect-error
      customCanvasBackgroundColor: {
        color: 'white'
      }
    },
    scales: {
      projection: {
        axis: 'r',
        // https://d3js.org/d3-geo/cylindrical
        // https://github.com/sgratzl/chartjs-chart-geo/blob/main/src/scales/ProjectionScale.ts
        projection: 'equirectangular',
      },
      size: {
        axis: 'r',
        range: [2, 20],
      },
    },
  };

  // https://www.chartjs.org/docs/latest/configuration/canvas-background.html
  const plugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart: Chart, _: any, options: { color: string }) => {
      const { ctx } = chart;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = options.color || '#99ffff';
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  };
  const config: ChartConfiguration<'bubbleMap'> = {
    type: 'bubbleMap',
    data,
    options,
    plugins: [ChartDataLabels, plugin],
  };

  // Create the chart
  new Chart(bubbleMapCanvas.value.getContext('2d') as CanvasRenderingContext2D, config);
}
</script>

<template>
  <div v-if="!rendered">
    <label>City</label>
    <ModelSelect ref="selectElement" placeholder="Capital city" :options="capitalOptions" v-model="selectedCity">
    </ModelSelect>
    <button @click="addSelected(selectedCity)">
      Add
    </button>
    <br />
    <div v-for="city in selectedCities">
      <label>{{ prettyPrintCity(city) }}</label>
      <input type="number" min="0" v-model="city.value" />
    </div>
    <button @click="renderMap(selectedCities)">Render</button>
  </div>
  <div>
    <div v-if="rendered">
      <a :href="bubbleMapCanvas.toDataURL()" target="_blank">Stand alone link</a>
    </div>
    <canvas ref="bubbleMapCanvas"></canvas>
  </div>
</template>


<style src="vue-search-select/dist/VueSearchSelect.css"></style>

<style scoped></style>
