import { defineComponent, useSSRContext, ref, mergeProps, unref } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { d as useHead } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'firebase-functions';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Diccionario Espa\xF1ol-Ndowe | ep\xE0lwi-r\xE8bbo",
      meta: [
        {
          name: "description",
          content: "Diccionario offline espa\xF1ol-ndowe para preservar el idioma. Funciona sin internet."
        }
      ]
    });
    const showInstallPrompt = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "dictionary-page" }, _attrs))} data-v-c77377e8><section class="hero mb-12 text-center" data-v-c77377e8><h2 class="text-4xl font-bold mb-6 text-secondary" data-v-c77377e8> Bienvenido al Diccionario Espa\xF1ol-Ndowe </h2><p class="text-lg text-muted max-w-2xl mx-auto mb-8" data-v-c77377e8> Preserva y aprende el idioma Ndowe con nuestro diccionario offline. Traduce palabras entre espa\xF1ol y ndowe sin necesidad de conexi\xF3n a internet. </p><div class="search-container max-w-lg mx-auto" data-v-c77377e8><div class="relative" data-v-c77377e8><input type="text" placeholder="Buscar palabra en espa\xF1ol o ndowe..." class="input w-full pl-12 pr-4 text-lg" disabled data-v-c77377e8><div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted" data-v-c77377e8> \u{1F50D} </div></div><p class="text-sm text-muted mt-3" data-v-c77377e8><em data-v-c77377e8>B\xFAsqueda disponible en pr\xF3ximas versiones</em></p></div></section><section class="features" data-v-c77377e8><h3 class="text-2xl font-semibold mb-8 text-center" data-v-c77377e8> Caracter\xEDsticas </h3><div class="grid grid-cols-1 md:grid-cols-3 gap-8" data-v-c77377e8><div class="card" data-v-c77377e8><div class="card__body text-center" data-v-c77377e8><div class="text-4xl mb-4" data-v-c77377e8>\u{1F4F1}</div><h4 class="font-semibold mb-3" data-v-c77377e8>Funciona sin Internet</h4><p class="text-muted" data-v-c77377e8> Accede al diccionario completo sin conexi\xF3n. Perfecto para estudiar en cualquier lugar. </p></div></div><div class="card" data-v-c77377e8><div class="card__body text-center" data-v-c77377e8><div class="text-4xl mb-4" data-v-c77377e8>\u{1F504}</div><h4 class="font-semibold mb-3" data-v-c77377e8>Bidireccional</h4><p class="text-muted" data-v-c77377e8> Traduce del espa\xF1ol al ndowe y viceversa. B\xFAsqueda inteligente en ambos idiomas. </p></div></div><div class="card" data-v-c77377e8><div class="card__body text-center" data-v-c77377e8><div class="text-4xl mb-4" data-v-c77377e8>\u{1F30D}</div><h4 class="font-semibold mb-3" data-v-c77377e8>Preservaci\xF3n Cultural</h4><p class="text-muted" data-v-c77377e8> Contribuye a mantener vivo el idioma ndowe para las futuras generaciones. </p></div></div></div></section>`);
      if (unref(showInstallPrompt)) {
        _push(`<section class="install-prompt mt-12" data-v-c77377e8><div class="card bg-secondary text-white" data-v-c77377e8><div class="card__body text-center" data-v-c77377e8><h4 class="font-semibold mb-3" data-v-c77377e8>\xA1Instala la aplicaci\xF3n!</h4><p class="mb-6" data-v-c77377e8> Instala ep\xE0lwi-r\xE8bbo en tu dispositivo para acceso r\xE1pido y funci\xF3n offline. </p><button class="btn btn--primary bg-white text-secondary" data-v-c77377e8> Instalar Aplicaci\xF3n </button></div></div></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c77377e8"]]);

export { index as default };
//# sourceMappingURL=index-HIaHpnPl.mjs.map
