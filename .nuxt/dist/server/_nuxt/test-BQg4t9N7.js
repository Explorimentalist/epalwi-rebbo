import { _ as __nuxt_component_0 } from "../server.mjs";
import { defineComponent, useSSRContext } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import "ofetch";
import "#internal/nuxt/paths";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/hookable/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/unctx/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/h3/dist/index.mjs";
import "pinia";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/radix3/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/ufo/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/klona/dist/index.mjs";
import "@iconify/vue";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "test",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtPage = __nuxt_component_0;
      _push(ssrRenderComponent(_component_NuxtPage, _attrs, null, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=test-BQg4t9N7.js.map
