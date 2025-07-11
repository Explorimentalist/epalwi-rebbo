<script setup lang="ts">
import Input from './Input.vue'
import { ref } from 'vue'
import { validateEmail, validateRequired } from '~/utils/validation'

// Define the story meta
const meta = {
  title: 'Common/Input',
  component: Input,
  tags: ['autodocs'],
}

// Sample validation functions
const emailValidation = (value: string) => {
  const result = validateEmail(value)
  return result.isValid ? null : result.message
}

const requiredValidation = (value: string) => {
  const result = validateRequired(value)
  return result.isValid ? null : result.message
}
</script>

<template>
  <Story 
    :meta="meta"
    :layout="{ type: 'single', iframe: false }"
  >
    <!-- Basic Input -->
    <Variant title="Basic Input" :init-state="{ value: '' }">
      <template #default="{ state }">
        <div class="w-full max-w-md">
          <Input
            v-model="state.value"
            label="Full Name"
            placeholder="Enter your full name"
          />
          <p class="text-sm text-gray-600 mt-2">Value: {{ state.value }}</p>
        </div>
      </template>
    </Variant>

    <!-- Email Input with Validation -->
    <Variant title="Email with Validation" :init-state="{ email: '' }">
      <template #default="{ state }">
        <div class="w-full max-w-md">
          <Input
            v-model="state.email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            :validation="emailValidation"
          />
          <p class="text-sm text-gray-600 mt-2">Value: {{ state.email }}</p>
        </div>
      </template>
    </Variant>

    <!-- Password Input -->
    <Variant title="Password Input" :init-state="{ password: '' }">
      <template #default="{ state }">
        <div class="w-full max-w-md">
          <Input
            v-model="state.password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            :validation="requiredValidation"
          />
          <p class="text-sm text-gray-600 mt-2">Length: {{ state.password.length }}</p>
        </div>
      </template>
    </Variant>

    <!-- Input with Icon -->
    <Variant title="Input with Icon" :init-state="{ searchValue: '' }">
      <template #default="{ state }">
        <div class="w-full max-w-md">
          <Input
            v-model="state.searchValue"
            label="Search"
            placeholder="Search..."
            icon="search"
          />
          <p class="text-sm text-gray-600 mt-2">Value: {{ state.searchValue }}</p>
        </div>
      </template>
    </Variant>

    <!-- Disabled State -->
    <Variant title="Disabled Input">
      <div class="w-full max-w-md">
        <Input
          model-value="This field is disabled"
          label="Disabled Field"
          disabled
        />
      </div>
    </Variant>

    <!-- Error State -->
    <Variant title="Error State">
      <div class="w-full max-w-md">
        <Input
          model-value="invalid-email"
          label="Email with Error"
          type="email"
          error="Please enter a valid email address"
        />
      </div>
    </Variant>

    <!-- Input States Demo -->
    <Variant title="All States" :init-state="{ 
      normalValue: 'Normal input',
      focusValue: 'Focus this field',
      errorValue: 'invalid-email',
      disabledValue: 'Disabled field'
    }">
      <template #default="{ state }">
        <div class="w-full max-w-md space-y-4">
          <Input
            v-model="state.normalValue"
            label="Normal State"
            placeholder="Normal input"
          />
          
          <Input
            v-model="state.focusValue"
            label="Focus State"
            placeholder="Click to focus"
          />
          
          <Input
            v-model="state.errorValue"
            label="Error State"
            type="email"
            error="Invalid email format"
          />
          
          <Input
            v-model="state.disabledValue"
            label="Disabled State"
            disabled
          />
        </div>
      </template>
    </Variant>

    <!-- Playground -->
    <Variant title="Playground" :init-state="{ 
      value: '',
      label: 'Label',
      placeholder: 'Enter text...',
      type: 'text',
      disabled: false,
      hasIcon: false,
      icon: 'search'
    }">
      <template #default="{ state }">
        <div class="w-full max-w-md">
          <Input
            v-model="state.value"
            :label="state.label"
            :placeholder="state.placeholder"
            :type="state.type"
            :disabled="state.disabled"
            :icon="state.hasIcon ? state.icon : undefined"
          />
          <div class="mt-4 p-3 bg-gray-100 rounded">
            <h4 class="font-medium text-sm mb-2">Generated Code:</h4>
            <code class="text-xs">
              &lt;Input<br/>
              &nbsp;&nbsp;v-model="value"<br/>
              &nbsp;&nbsp;label="{{ state.label }}"<br/>
              &nbsp;&nbsp;placeholder="{{ state.placeholder }}"<br/>
              <span v-if="state.type !== 'text'">&nbsp;&nbsp;type="{{ state.type }}"<br/></span>
              <span v-if="state.disabled">&nbsp;&nbsp;disabled<br/></span>
              <span v-if="state.hasIcon">&nbsp;&nbsp;icon="{{ state.icon }}"<br/></span>
              /&gt;
            </code>
          </div>
        </div>
      </template>
      
      <template #controls="{ state }">
        <HstText
          v-model="state.label"
          title="Label"
        />
        <HstText
          v-model="state.placeholder"
          title="Placeholder"
        />
        <HstSelect
          v-model="state.type"
          title="Type"
          :options="['text', 'email', 'password', 'search', 'tel', 'url']"
        />
        <HstCheckbox
          v-model="state.disabled"
          title="Disabled"
        />
        <HstCheckbox
          v-model="state.hasIcon"
          title="Has Icon"
        />
        <HstSelect
          v-if="state.hasIcon"
          v-model="state.icon"
          title="Icon"
          :options="['search', 'mail', 'user', 'lock', 'phone', 'globe']"
        />
      </template>
    </Variant>
  </Story>
</template>

<style scoped>
.story-variant {
  padding: 24px;
}
</style> 