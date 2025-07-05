import { defineComponent, ref, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
import { d as useHead } from "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "ofetch";
import "#internal/nuxt/paths";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/hookable/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/unctx/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/radix3/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/defu/dist/defu.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/ufo/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/klona/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Diccionario Español-Ndowe | epàlwi-rèbbo",
      meta: [
        {
          name: "description",
          content: "Diccionario offline español-ndowe para preservar el idioma. Funciona sin internet."
        }
      ]
    });
    const showInstallPrompt = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "dictionary-page" }, _attrs))} data-v-c77377e8><section class="hero mb-12 text-center" data-v-c77377e8><h2 class="text-4xl font-bold mb-6 text-secondary" data-v-c77377e8> Bienvenido al Diccionario Español-Ndowe </h2><p class="text-lg text-muted max-w-2xl mx-auto mb-8" data-v-c77377e8> Preserva y aprende el idioma Ndowe con nuestro diccionario offline. Traduce palabras entre español y ndowe sin necesidad de conexión a internet. </p><div class="search-container max-w-lg mx-auto" data-v-c77377e8><div class="relative" data-v-c77377e8><input type="text" placeholder="Buscar palabra en español o ndowe..." class="input w-full pl-12 pr-4 text-lg" disabled data-v-c77377e8><div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted" data-v-c77377e8> 🔍 </div></div><p class="text-sm text-muted mt-3" data-v-c77377e8><em data-v-c77377e8>Búsqueda disponible en próximas versiones</em></p></div></section><section class="features" data-v-c77377e8><h3 class="text-2xl font-semibold mb-8 text-center" data-v-c77377e8> Características </h3><div class="grid grid-cols-1 md:grid-cols-3 gap-8" data-v-c77377e8><div class="card" data-v-c77377e8><div class="card__body text-center" data-v-c77377e8><div class="text-4xl mb-4" data-v-c77377e8>📱</div><h4 class="font-semibold mb-3" data-v-c77377e8>Funciona sin Internet</h4><p class="text-muted" data-v-c77377e8> Accede al diccionario completo sin conexión. Perfecto para estudiar en cualquier lugar. </p></div></div><div class="card" data-v-c77377e8><div class="card__body text-center" data-v-c77377e8><div class="text-4xl mb-4" data-v-c77377e8>🔄</div><h4 class="font-semibold mb-3" data-v-c77377e8>Bidireccional</h4><p class="text-muted" data-v-c77377e8> Traduce del español al ndowe y viceversa. Búsqueda inteligente en ambos idiomas. </p></div></div><div class="card" data-v-c77377e8><div class="card__body text-center" data-v-c77377e8><div class="text-4xl mb-4" data-v-c77377e8>🌍</div><h4 class="font-semibold mb-3" data-v-c77377e8>Preservación Cultural</h4><p class="text-muted" data-v-c77377e8> Contribuye a mantener vivo el idioma ndowe para las futuras generaciones. </p></div></div></div></section>`);
      if (unref(showInstallPrompt)) {
        _push(`<section class="install-prompt mt-12" data-v-c77377e8><div class="card bg-secondary text-white" data-v-c77377e8><div class="card__body text-center" data-v-c77377e8><h4 class="font-semibold mb-3" data-v-c77377e8>¡Instala la aplicación!</h4><p class="mb-6" data-v-c77377e8> Instala epàlwi-rèbbo en tu dispositivo para acceso rápido y función offline. </p><button class="btn btn--primary bg-white text-secondary" data-v-c77377e8> Instalar Aplicación </button></div></div></section>`);
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
export {
  index as default
};
//# sourceMappingURL=index-HIaHpnPl.js.map
