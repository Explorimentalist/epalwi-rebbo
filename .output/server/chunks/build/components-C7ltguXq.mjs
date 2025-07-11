import { _ as __nuxt_component_0 } from './nuxt-link-BrHGT_GJ.mjs';
import __nuxt_component_1 from './index-C3-WOosm.mjs';
import { defineComponent, ref, watch, resolveComponent, mergeProps, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { a as useSeoMeta } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../nitro/nitro.mjs';
import 'fs/promises';
import 'path';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@iconify/utils';
import 'consola';
import 'firebase-functions';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
import 'pinia';
import 'vue-router';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "components",
  __ssrInlineRender: true,
  setup(__props) {
    const testStates = ref({
      inputValues: {
        name: "",
        email: "pacodelcampo@mailinator",
        password: "",
        search: "Casa"
      },
      modalOpen: false,
      selectedIcon: "search",
      bannerDismissed: false
    });
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    const availableIcons = [
      "search",
      "menu",
      "user",
      "settings",
      "heart",
      "star",
      "mail",
      "bell",
      "home",
      "bookmark",
      "share",
      "download",
      "check",
      "x",
      "arrow-left",
      "arrow-right",
      "loader"
    ];
    const componentStatus = ref({
      Icon: "completed",
      Input: "completed",
      Modal: "completed",
      EmptyState: "completed",
      TrialBanner: "completed"
    });
    const formData = ref({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      website: ""
    });
    const formErrors = ref({
      email: "",
      password: "",
      confirmPassword: ""
    });
    const validateForm = () => {
      formErrors.value.email = formData.value.email && !validateEmail(formData.value.email) ? "Please enter a valid email address" : "";
      formErrors.value.password = formData.value.password && formData.value.password.length < 6 ? "Password must be at least 6 characters" : "";
      formErrors.value.confirmPassword = formData.value.confirmPassword && formData.value.confirmPassword !== formData.value.password ? "Passwords do not match" : "";
    };
    watch(formData, validateForm, { deep: true });
    useSeoMeta({
      title: "Component Testing - ep\xE0lwi-r\xE8bbo",
      description: "Interactive component testing and showcase page"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Icon = __nuxt_component_1;
      const _component_Input = resolveComponent("Input");
      const _component_Modal = resolveComponent("Modal");
      const _component_EmptyState = resolveComponent("EmptyState");
      const _component_TrialBanner = resolveComponent("TrialBanner");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[#F2EDEB] text-gray-800" }, _attrs))} data-v-790f2a09><div class="bg-white shadow-sm border-b" data-v-790f2a09><div class="container mx-auto px-4 py-6" data-v-790f2a09><div class="flex flex-col md:flex-row md:items-center justify-between gap-4" data-v-790f2a09><div data-v-790f2a09><h1 class="text-3xl font-bold text-gray-800" data-v-790f2a09>Component Testing</h1><p class="text-gray-600 mt-2" data-v-790f2a09>Interactive showcase of all Phase 4A components</p></div><div class="flex flex-col sm:flex-row gap-4" data-v-790f2a09>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "text-[#D45B41] hover:underline text-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u2190 Back to Dictionary `);
          } else {
            return [
              createTextVNode(" \u2190 Back to Dictionary ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/test",
        class: "text-[#D45B41] hover:underline text-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u2190 Phase 3 Tests `);
          } else {
            return [
              createTextVNode(" \u2190 Phase 3 Tests ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div><div class="container mx-auto px-4 py-8" data-v-790f2a09><div class="mb-8" data-v-790f2a09><h2 class="text-2xl font-semibold mb-4" data-v-790f2a09>\u{1F4CA} Component Status Overview</h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" data-v-790f2a09><!--[-->`);
      ssrRenderList(componentStatus.value, (status, component) => {
        _push(`<div class="bg-white rounded-lg p-4 shadow-sm border" data-v-790f2a09><div class="flex items-center justify-between" data-v-790f2a09><h3 class="font-medium" data-v-790f2a09>${ssrInterpolate(component)}</h3><span class="${ssrRenderClass([status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800", "px-2 py-1 text-xs rounded-full"])}" data-v-790f2a09>${ssrInterpolate(status)}</span></div></div>`);
      });
      _push(`<!--]--></div></div><div class="mb-12" data-v-790f2a09><h2 class="text-2xl font-semibold mb-6" data-v-790f2a09>\u{1F9E9} Icon Component</h2><div class="bg-white rounded-lg p-6 shadow-sm border mb-6" data-v-790f2a09><h3 class="text-lg font-medium mb-4" data-v-790f2a09>Size Variants</h3><div class="flex items-center gap-6 flex-wrap" data-v-790f2a09><div class="flex flex-col items-center gap-2" data-v-790f2a09>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "search",
        size: "sm"
      }, null, _parent));
      _push(`<span class="text-xs" data-v-790f2a09>sm (12px)</span></div><div class="flex flex-col items-center gap-2" data-v-790f2a09>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "search",
        size: "base"
      }, null, _parent));
      _push(`<span class="text-xs" data-v-790f2a09>base (16px)</span></div><div class="flex flex-col items-center gap-2" data-v-790f2a09>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "search",
        size: "md"
      }, null, _parent));
      _push(`<span class="text-xs" data-v-790f2a09>md (20px)</span></div><div class="flex flex-col items-center gap-2" data-v-790f2a09>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "search",
        size: "lg"
      }, null, _parent));
      _push(`<span class="text-xs" data-v-790f2a09>lg (24px)</span></div><div class="flex flex-col items-center gap-2" data-v-790f2a09>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "search",
        size: "xl"
      }, null, _parent));
      _push(`<span class="text-xs" data-v-790f2a09>xl (32px)</span></div></div></div><div class="bg-white rounded-lg p-6 shadow-sm border mb-6" data-v-790f2a09><h3 class="text-lg font-medium mb-4" data-v-790f2a09>Icon Gallery</h3><div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4" data-v-790f2a09><!--[-->`);
      ssrRenderList(availableIcons, (iconName) => {
        _push(`<div class="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" data-v-790f2a09>`);
        _push(ssrRenderComponent(_component_Icon, {
          name: iconName,
          size: "md",
          class: "text-gray-700"
        }, null, _parent));
        _push(`<span class="text-xs text-center text-gray-600" data-v-790f2a09>${ssrInterpolate(iconName)}</span></div>`);
      });
      _push(`<!--]--></div></div><div class="bg-white rounded-lg p-6 shadow-sm border" data-v-790f2a09><h3 class="text-lg font-medium mb-4" data-v-790f2a09>Interactive Test</h3><div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4" data-v-790f2a09><label class="font-medium text-gray-800" data-v-790f2a09>Selected Icon:</label><select class="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" data-v-790f2a09><!--[-->`);
      ssrRenderList(availableIcons, (icon) => {
        _push(`<option${ssrRenderAttr("value", icon)} data-v-790f2a09${ssrIncludeBooleanAttr(Array.isArray(testStates.value.selectedIcon) ? ssrLooseContain(testStates.value.selectedIcon, icon) : ssrLooseEqual(testStates.value.selectedIcon, icon)) ? " selected" : ""}>${ssrInterpolate(icon)}</option>`);
      });
      _push(`<!--]--></select><div class="flex items-center gap-2" data-v-790f2a09>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: testStates.value.selectedIcon,
        size: "md",
        class: "text-blue-600"
      }, null, _parent));
      _push(`<span class="text-sm text-gray-600" data-v-790f2a09>\u2190 Live Preview</span></div></div><div class="p-4 bg-gray-100 rounded-lg" data-v-790f2a09><code class="text-sm text-gray-800" data-v-790f2a09> &lt;Icon name=&quot;${ssrInterpolate(testStates.value.selectedIcon)}&quot; size=&quot;md&quot; /&gt; </code></div></div></div><div class="mb-12" data-v-790f2a09><h2 class="text-2xl font-semibold mb-6" data-v-790f2a09>\u{1F4DD} Input Component</h2><div class="grid grid-cols-1 lg:grid-cols-2 gap-6" data-v-790f2a09><div class="bg-gray-100 rounded-lg p-6 space-y-4" data-v-790f2a09><h3 class="text-lg font-medium text-gray-800 mb-4" data-v-790f2a09>Basic Input</h3>`);
      _push(ssrRenderComponent(_component_Input, {
        modelValue: testStates.value.inputValues.name,
        "onUpdate:modelValue": ($event) => testStates.value.inputValues.name = $event,
        label: "Full Name",
        placeholder: "Enter your full name",
        "leading-icon": "user"
      }, null, _parent));
      _push(`<p class="text-sm text-gray-600" data-v-790f2a09>Value: ${ssrInterpolate(testStates.value.inputValues.name || "Empty")}</p></div><div class="bg-gray-100 rounded-lg p-6 space-y-4" data-v-790f2a09><h3 class="text-lg font-medium text-gray-800 mb-4" data-v-790f2a09>Email with Validation</h3>`);
      _push(ssrRenderComponent(_component_Input, {
        modelValue: testStates.value.inputValues.email,
        "onUpdate:modelValue": ($event) => testStates.value.inputValues.email = $event,
        label: "Email Address",
        type: "email",
        placeholder: "Enter your email",
        "leading-icon": "mail",
        error: testStates.value.inputValues.email && !validateEmail(testStates.value.inputValues.email) ? "Please enter a valid email" : "",
        "show-validation-icons": true
      }, null, _parent));
      _push(`<p class="text-sm text-gray-600" data-v-790f2a09> Valid: ${ssrInterpolate(testStates.value.inputValues.email ? validateEmail(testStates.value.inputValues.email) ? "\u2705" : "\u274C" : "N/A")}</p></div><div class="bg-gray-100 rounded-lg p-6 space-y-4" data-v-790f2a09><h3 class="text-lg font-medium text-gray-800 mb-4" data-v-790f2a09>Password Input</h3>`);
      _push(ssrRenderComponent(_component_Input, {
        modelValue: testStates.value.inputValues.password,
        "onUpdate:modelValue": ($event) => testStates.value.inputValues.password = $event,
        label: "Password",
        type: "password",
        placeholder: "Enter your password",
        "leading-icon": "settings"
      }, null, _parent));
      _push(`<p class="text-sm text-gray-600" data-v-790f2a09>Length: ${ssrInterpolate(testStates.value.inputValues.password.length)}</p></div><div class="bg-gray-100 rounded-lg p-6 space-y-4" data-v-790f2a09><h3 class="text-lg font-medium text-gray-800 mb-4" data-v-790f2a09>Search with Icon</h3>`);
      _push(ssrRenderComponent(_component_Input, {
        modelValue: testStates.value.inputValues.search,
        "onUpdate:modelValue": ($event) => testStates.value.inputValues.search = $event,
        label: "Search Dictionary",
        type: "search",
        placeholder: "Search for a word...",
        "leading-icon": "search",
        "trailing-icon": "x"
      }, null, _parent));
      _push(`<p class="text-sm text-gray-600" data-v-790f2a09>Value: ${ssrInterpolate(testStates.value.inputValues.search || "Empty")}</p></div></div><div class="mt-8" data-v-790f2a09><div class="bg-gray-100 rounded-lg p-6 space-y-4" data-v-790f2a09><h3 class="text-lg font-medium text-gray-800 mb-6" data-v-790f2a09>Input States Demo</h3><div class="grid grid-cols-1 md:grid-cols-2 gap-6" data-v-790f2a09><div class="space-y-4" data-v-790f2a09>`);
      _push(ssrRenderComponent(_component_Input, {
        modelValue: formData.value.fullName,
        "onUpdate:modelValue": ($event) => formData.value.fullName = $event,
        label: "Full Name",
        placeholder: "Enter your full name",
        "leading-icon": "user",
        required: ""
      }, null, _parent));
      _push(ssrRenderComponent(_component_Input, {
        modelValue: formData.value.email,
        "onUpdate:modelValue": ($event) => formData.value.email = $event,
        label: "Email Address",
        type: "email",
        placeholder: "your.email@example.com",
        "leading-icon": "mail",
        error: formErrors.value.email,
        required: ""
      }, null, _parent));
      _push(ssrRenderComponent(_component_Input, {
        modelValue: formData.value.phone,
        "onUpdate:modelValue": ($event) => formData.value.phone = $event,
        label: "Phone Number",
        type: "tel",
        placeholder: "+1 (555) 123-4567",
        "leading-icon": "bell",
        "helper-text": "We'll never share your phone number"
      }, null, _parent));
      _push(`</div><div class="space-y-4" data-v-790f2a09>`);
      _push(ssrRenderComponent(_component_Input, {
        modelValue: formData.value.password,
        "onUpdate:modelValue": ($event) => formData.value.password = $event,
        label: "Password",
        type: "password",
        placeholder: "Create a strong password",
        "leading-icon": "settings",
        error: formErrors.value.password,
        required: ""
      }, null, _parent));
      _push(ssrRenderComponent(_component_Input, {
        modelValue: formData.value.confirmPassword,
        "onUpdate:modelValue": ($event) => formData.value.confirmPassword = $event,
        label: "Confirm Password",
        type: "password",
        placeholder: "Repeat your password",
        "leading-icon": "check",
        error: formErrors.value.confirmPassword,
        required: ""
      }, null, _parent));
      _push(ssrRenderComponent(_component_Input, {
        modelValue: formData.value.website,
        "onUpdate:modelValue": ($event) => formData.value.website = $event,
        label: "Website (Optional)",
        type: "url",
        placeholder: "https://yourwebsite.com",
        "leading-icon": "share",
        "helper-text": "Personal or business website"
      }, null, _parent));
      _push(`</div></div><div class="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200" data-v-790f2a09><button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" data-v-790f2a09> Submit Form </button><button class="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2" data-v-790f2a09> Reset </button></div></div></div></div><div class="mb-12" data-v-790f2a09><h2 class="text-2xl font-semibold mb-6" data-v-790f2a09>\u{1FA9F} Modal Component</h2><div class="bg-white rounded-lg p-6 shadow-sm border" data-v-790f2a09><h3 class="text-lg font-medium mb-4" data-v-790f2a09>Interactive Modal</h3><button class="px-6 py-3 bg-[#D45B41] text-white rounded-lg hover:bg-[#B8412F] transition-colors focus:ring-2 focus:ring-[#D45B41] focus:ring-offset-2" data-v-790f2a09> Open Modal </button>`);
      _push(ssrRenderComponent(_component_Modal, {
        modelValue: testStates.value.modalOpen,
        "onUpdate:modelValue": ($event) => testStates.value.modalOpen = $event
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="bg-gray-100 p-6 space-y-4" data-v-790f2a09${_scopeId}><h3 class="text-xl font-semibold text-gray-800" data-v-790f2a09${_scopeId}>Test Modal</h3><p class="text-gray-600" data-v-790f2a09${_scopeId}>This is a responsive modal component with proper accessibility features.</p><div class="space-y-4" data-v-790f2a09${_scopeId}>`);
            _push2(ssrRenderComponent(_component_Input, {
              modelValue: testStates.value.inputValues.name,
              "onUpdate:modelValue": ($event) => testStates.value.inputValues.name = $event,
              label: "Your Name",
              placeholder: "Enter your name",
              "leading-icon": "user"
            }, null, _parent2, _scopeId));
            _push2(`<div class="flex flex-col sm:flex-row gap-3" data-v-790f2a09${_scopeId}><button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" data-v-790f2a09${_scopeId}> Save Changes </button><button class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors" data-v-790f2a09${_scopeId}> Cancel </button></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "bg-gray-100 p-6 space-y-4" }, [
                createVNode("h3", { class: "text-xl font-semibold text-gray-800" }, "Test Modal"),
                createVNode("p", { class: "text-gray-600" }, "This is a responsive modal component with proper accessibility features."),
                createVNode("div", { class: "space-y-4" }, [
                  createVNode(_component_Input, {
                    modelValue: testStates.value.inputValues.name,
                    "onUpdate:modelValue": ($event) => testStates.value.inputValues.name = $event,
                    label: "Your Name",
                    placeholder: "Enter your name",
                    "leading-icon": "user"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode("div", { class: "flex flex-col sm:flex-row gap-3" }, [
                    createVNode("button", {
                      onClick: ($event) => testStates.value.modalOpen = false,
                      class: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    }, " Save Changes ", 8, ["onClick"]),
                    createVNode("button", {
                      onClick: ($event) => testStates.value.modalOpen = false,
                      class: "px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                    }, " Cancel ", 8, ["onClick"])
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="mb-12" data-v-790f2a09><h2 class="text-2xl font-semibold mb-6" data-v-790f2a09>\u{1F50D} EmptyState Component</h2><div class="grid grid-cols-1 lg:grid-cols-2 gap-6" data-v-790f2a09><div class="bg-white rounded-lg p-6 shadow-sm border" data-v-790f2a09><h3 class="text-lg font-medium mb-4" data-v-790f2a09>Default Empty State</h3>`);
      _push(ssrRenderComponent(_component_EmptyState, {
        title: "No results found",
        description: "Try adjusting your search terms"
      }, null, _parent));
      _push(`</div><div class="bg-white rounded-lg p-6 shadow-sm border" data-v-790f2a09><h3 class="text-lg font-medium mb-4" data-v-790f2a09>Custom Empty State</h3>`);
      _push(ssrRenderComponent(_component_EmptyState, {
        title: "Dictionary Loading...",
        description: "Please wait while we prepare your content",
        "show-action": false
      }, null, _parent));
      _push(`</div></div></div><div class="mb-12" data-v-790f2a09><h2 class="text-2xl font-semibold mb-6" data-v-790f2a09>\u{1F3AF} TrialBanner Component</h2><div class="bg-white rounded-lg p-6 shadow-sm border" data-v-790f2a09><h3 class="text-lg font-medium mb-4" data-v-790f2a09>Trial Banner</h3>`);
      _push(ssrRenderComponent(_component_TrialBanner, null, null, _parent));
      _push(`<div class="mt-4 p-4 bg-gray-50 rounded-lg" data-v-790f2a09><p class="text-sm text-gray-600 mb-2" data-v-790f2a09>Test Controls:</p><button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm" data-v-790f2a09> Reset Banner </button></div></div></div><div class="mb-12" data-v-790f2a09><h2 class="text-2xl font-semibold mb-6" data-v-790f2a09>\u{1F3A8} Design System Preview</h2><div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-v-790f2a09><div class="bg-white rounded-lg p-6 shadow-sm border" data-v-790f2a09><h3 class="text-lg font-medium mb-4" data-v-790f2a09>Color Palette</h3><div class="space-y-3" data-v-790f2a09><div class="flex items-center gap-3" data-v-790f2a09><div class="w-8 h-8 bg-[#D45B41] rounded" data-v-790f2a09></div><span class="text-sm" data-v-790f2a09>Primary (#D45B41)</span></div><div class="flex items-center gap-3" data-v-790f2a09><div class="w-8 h-8 bg-[#F2EDEB] border rounded" data-v-790f2a09></div><span class="text-sm" data-v-790f2a09>Background (#F2EDEB)</span></div><div class="flex items-center gap-3" data-v-790f2a09><div class="w-8 h-8 bg-gray-800 rounded" data-v-790f2a09></div><span class="text-sm" data-v-790f2a09>Text (gray-800)</span></div><div class="flex items-center gap-3" data-v-790f2a09><div class="w-8 h-8 bg-gray-100 border rounded" data-v-790f2a09></div><span class="text-sm" data-v-790f2a09>Form BG (gray-100)</span></div></div></div><div class="bg-white rounded-lg p-6 shadow-sm border" data-v-790f2a09><h3 class="text-lg font-medium mb-4" data-v-790f2a09>8px Spacing System</h3><div class="space-y-2" data-v-790f2a09><div class="flex items-center gap-3" data-v-790f2a09><div class="w-4 h-4 bg-blue-500" data-v-790f2a09></div><span class="text-sm" data-v-790f2a09>space-4 (16px)</span></div><div class="flex items-center gap-3" data-v-790f2a09><div class="w-6 h-6 bg-blue-500" data-v-790f2a09></div><span class="text-sm" data-v-790f2a09>space-6 (24px)</span></div><div class="flex items-center gap-3" data-v-790f2a09><div class="w-8 h-8 bg-blue-500" data-v-790f2a09></div><span class="text-sm" data-v-790f2a09>space-8 (32px)</span></div></div></div><div class="bg-white rounded-lg p-6 shadow-sm border" data-v-790f2a09><h3 class="text-lg font-medium mb-4" data-v-790f2a09>Typography</h3><div class="space-y-2" data-v-790f2a09><p class="text-3xl font-bold" data-v-790f2a09>Heading (3xl)</p><p class="text-lg font-medium" data-v-790f2a09>Subheading (lg)</p><p class="text-base" data-v-790f2a09>Body text (base)</p><p class="text-sm text-gray-600" data-v-790f2a09>Caption (sm)</p></div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test/components.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const components = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-790f2a09"]]);

export { components as default };
//# sourceMappingURL=components-C7ltguXq.mjs.map
