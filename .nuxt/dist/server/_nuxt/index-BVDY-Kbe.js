import { _ as __nuxt_component_0 } from "./nuxt-link-BrHGT_GJ.js";
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/ufo/dist/index.mjs";
import "../server.mjs";
import "ofetch";
import "#internal/nuxt/paths";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/hookable/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/unctx/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/h3/dist/index.mjs";
import "pinia";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/radix3/dist/index.mjs";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/klona/dist/index.mjs";
import "@iconify/vue";
import "/Users/ngatyebrianoko/Documents/Design Projects/Explorimentalist/GPT_apps/epàlwi-rèbbo/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const apiLoading = ref(false);
    const apiResult = ref(null);
    const indexedDBLoading = ref(false);
    const indexedDBResult = ref(null);
    const searchQuery = ref("casa");
    const searchLanguage = ref("spanish");
    const searchLoading = ref(false);
    const searchResults = ref([]);
    const searchError = ref("");
    const composableLoading = ref(false);
    const composableResult = ref(null);
    const performanceResults = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "test-page" }, _attrs))} data-v-6cfbe2b1><div class="container mx-auto p-6" data-v-6cfbe2b1><div class="flex items-center justify-between mb-6" data-v-6cfbe2b1><h1 class="text-3xl font-bold" data-v-6cfbe2b1>Phase 3 Testing Dashboard</h1>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/test/components",
        class: "px-4 py-2 bg-[#D45B41] text-white rounded-lg hover:bg-[#B8412F] transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` 📝 Component Testing → `);
          } else {
            return [
              createTextVNode(" 📝 Component Testing → ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><section class="mb-8 p-4 border rounded-lg" data-v-6cfbe2b1><h2 class="text-xl font-semibold mb-4" data-v-6cfbe2b1>📡 API Endpoint Test</h2><div class="space-y-2" data-v-6cfbe2b1><button${ssrIncludeBooleanAttr(unref(apiLoading)) ? " disabled" : ""} class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50" data-v-6cfbe2b1>${ssrInterpolate(unref(apiLoading) ? "Testing..." : "Test Dictionary API")}</button>`);
      if (unref(apiResult)) {
        _push(`<div class="mt-2" data-v-6cfbe2b1><p class="font-semibold" data-v-6cfbe2b1>API Status: <span class="${ssrRenderClass(unref(apiResult).success ? "text-green-600" : "text-red-600")}" data-v-6cfbe2b1>${ssrInterpolate(unref(apiResult).success ? "✅ Success" : "❌ Failed")}</span></p>`);
        if (unref(apiResult).data) {
          _push(`<p data-v-6cfbe2b1>Entries: ${ssrInterpolate(((_a = unref(apiResult).data.metadata) == null ? void 0 : _a.total_entries) || "N/A")}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(apiResult).error) {
          _push(`<p class="text-red-600" data-v-6cfbe2b1>Error: ${ssrInterpolate(unref(apiResult).error)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section><section class="mb-8 p-4 border rounded-lg" data-v-6cfbe2b1><h2 class="text-xl font-semibold mb-4" data-v-6cfbe2b1>💾 IndexedDB Service Test</h2><div class="space-y-2" data-v-6cfbe2b1><button${ssrIncludeBooleanAttr(unref(indexedDBLoading)) ? " disabled" : ""} class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50" data-v-6cfbe2b1>${ssrInterpolate(unref(indexedDBLoading) ? "Testing..." : "Test IndexedDB")}</button>`);
      if (unref(indexedDBResult)) {
        _push(`<div class="mt-2" data-v-6cfbe2b1><p class="font-semibold" data-v-6cfbe2b1>IndexedDB Status: <span class="${ssrRenderClass(unref(indexedDBResult).success ? "text-green-600" : "text-red-600")}" data-v-6cfbe2b1>${ssrInterpolate(unref(indexedDBResult).success ? "✅ Success" : "❌ Failed")}</span></p>`);
        if (unref(indexedDBResult).entriesCount) {
          _push(`<p data-v-6cfbe2b1>Cached Entries: ${ssrInterpolate(unref(indexedDBResult).entriesCount)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(indexedDBResult).cacheValid !== void 0) {
          _push(`<p data-v-6cfbe2b1> Cache Valid: <span class="${ssrRenderClass(unref(indexedDBResult).cacheValid ? "text-green-600" : "text-orange-600")}" data-v-6cfbe2b1>${ssrInterpolate(unref(indexedDBResult).cacheValid ? "✅ Yes" : "🔄 No (needs refresh)")}</span></p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(indexedDBResult).error) {
          _push(`<p class="text-red-600" data-v-6cfbe2b1>Error: ${ssrInterpolate(unref(indexedDBResult).error)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section><section class="mb-8 p-4 border rounded-lg" data-v-6cfbe2b1><h2 class="text-xl font-semibold mb-4" data-v-6cfbe2b1>🔍 Search Service Test</h2><div class="space-y-4" data-v-6cfbe2b1><div class="flex gap-2" data-v-6cfbe2b1><input${ssrRenderAttr("value", unref(searchQuery))} placeholder="Enter search term (e.g., casa, hola)" class="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" data-v-6cfbe2b1><select class="px-3 py-2 border rounded" data-v-6cfbe2b1><option value="spanish" data-v-6cfbe2b1${ssrIncludeBooleanAttr(Array.isArray(unref(searchLanguage)) ? ssrLooseContain(unref(searchLanguage), "spanish") : ssrLooseEqual(unref(searchLanguage), "spanish")) ? " selected" : ""}>Español</option><option value="ndowe" data-v-6cfbe2b1${ssrIncludeBooleanAttr(Array.isArray(unref(searchLanguage)) ? ssrLooseContain(unref(searchLanguage), "ndowe") : ssrLooseEqual(unref(searchLanguage), "ndowe")) ? " selected" : ""}>Ndowe</option></select><button${ssrIncludeBooleanAttr(unref(searchLoading) || !unref(searchQuery)) ? " disabled" : ""} class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50" data-v-6cfbe2b1>${ssrInterpolate(unref(searchLoading) ? "Searching..." : "Search")}</button></div>`);
      if (unref(searchResults)) {
        _push(`<div class="mt-4" data-v-6cfbe2b1><p class="font-semibold" data-v-6cfbe2b1>Search Results: ${ssrInterpolate(unref(searchResults).length)} found</p>`);
        if (unref(searchResults).length > 0) {
          _push(`<div class="mt-2 space-y-2 max-h-64 overflow-y-auto" data-v-6cfbe2b1><!--[-->`);
          ssrRenderList(unref(searchResults).slice(0, 5), (result) => {
            var _a2, _b;
            _push(`<div class="p-2 bg-gray-50 rounded text-sm" data-v-6cfbe2b1><strong data-v-6cfbe2b1>${ssrInterpolate(result.entry.español)}</strong> → <span class="text-blue-600" data-v-6cfbe2b1>${ssrInterpolate(((_a2 = result.entry.ndowe) == null ? void 0 : _a2.join(", ")) || "No translation")}</span>`);
            if (result.score) {
              _push(`<div class="text-xs text-gray-500" data-v-6cfbe2b1>Score: ${ssrInterpolate((_b = result.score) == null ? void 0 : _b.toFixed(3))}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(searchError)) {
        _push(`<div class="text-red-600" data-v-6cfbe2b1> Error: ${ssrInterpolate(unref(searchError))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section><section class="mb-8 p-4 border rounded-lg" data-v-6cfbe2b1><h2 class="text-xl font-semibold mb-4" data-v-6cfbe2b1>🎯 Dictionary Composable Test</h2><div class="space-y-2" data-v-6cfbe2b1><button${ssrIncludeBooleanAttr(unref(composableLoading)) ? " disabled" : ""} class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50" data-v-6cfbe2b1>${ssrInterpolate(unref(composableLoading) ? "Testing..." : "Test useDictionary Composable")}</button>`);
      if (unref(composableResult)) {
        _push(`<div class="mt-2" data-v-6cfbe2b1><p class="font-semibold" data-v-6cfbe2b1>Composable Status: <span class="${ssrRenderClass(unref(composableResult).success ? "text-green-600" : "text-red-600")}" data-v-6cfbe2b1>${ssrInterpolate(unref(composableResult).success ? "✅ Success" : "❌ Failed")}</span></p>`);
        if (unref(composableResult).isReady) {
          _push(`<p data-v-6cfbe2b1>Ready: ${ssrInterpolate(unref(composableResult).isReady)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(composableResult).entriesCount) {
          _push(`<p data-v-6cfbe2b1>Total Entries: ${ssrInterpolate(unref(composableResult).entriesCount)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(composableResult).currentLanguage) {
          _push(`<p data-v-6cfbe2b1>Current Language: ${ssrInterpolate(unref(composableResult).currentLanguage)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(composableResult).error) {
          _push(`<p class="text-red-600" data-v-6cfbe2b1>Error: ${ssrInterpolate(unref(composableResult).error)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section><section class="mb-8 p-4 border rounded-lg" data-v-6cfbe2b1><h2 class="text-xl font-semibold mb-4" data-v-6cfbe2b1>⚡ Performance Test</h2>`);
      if (unref(performanceResults)) {
        _push(`<div class="space-y-2 text-sm" data-v-6cfbe2b1><p data-v-6cfbe2b1><strong data-v-6cfbe2b1>API Response Time:</strong> ${ssrInterpolate(unref(performanceResults).apiTime)}ms</p><p data-v-6cfbe2b1><strong data-v-6cfbe2b1>IndexedDB Init Time:</strong> ${ssrInterpolate(unref(performanceResults).indexedDBTime)}ms</p><p data-v-6cfbe2b1><strong data-v-6cfbe2b1>Search Time:</strong> ${ssrInterpolate(unref(performanceResults).searchTime)}ms</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6cfbe2b1"]]);
export {
  index as default
};
//# sourceMappingURL=index-BVDY-Kbe.js.map
