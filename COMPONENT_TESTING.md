# Component Testing Guide

## 🎯 Overview

This project uses a simple, effective component testing system built directly into the Nuxt 3 application. This approach provides:

- **Zero Configuration**: Uses the same setup as your main app
- **Real-time Testing**: Instant feedback with hot module replacement
- **Full Integration**: Access to all composables, stores, and utilities
- **Visual Testing**: See components in action with live interactions

## 🚀 Quick Start

### Access the Component Testing Page

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit the testing page**:
   ```
   http://localhost:3000/test/components
   ```

3. **Alternative command** (shows the URL):
   ```bash
   npm run test:components
   ```

## 📋 What's Available

### 📊 Component Status Overview
- Real-time tracking of all Phase 4A components
- Status indicators for each component

### 🧩 Icon Component Testing
- **Size Variants**: Visual showcase of all icon sizes (sm → xl)
- **Icon Gallery**: Interactive preview of 15+ common icons
- **Interactive Test**: Dynamic icon selection with generated code

### 📝 Input Component Testing
- **Basic Input**: Name input with live value display
- **Email Validation**: Real-time email format validation
- **Password Input**: Secure password field with length tracking
- **Search with Icon**: Input with integrated search icon
- **State Testing**: Normal, error, and disabled states

### 🖼️ Modal Component Testing
- **Interactive Modal**: Click to open/close
- **Form Integration**: Modal with input fields
- **Focus Management**: Proper keyboard navigation
- **Action Buttons**: Save/cancel functionality

### 🈳 EmptyState Component Testing
- **Default State**: Basic empty state display
- **Custom Messages**: Different titles and descriptions
- **Action Integration**: Buttons with click handlers
- **Loading State**: Animated loading indicators

### 🎯 TrialBanner Component Testing
- **Banner Display**: Full trial banner functionality
- **Dismissal Logic**: 7-day localStorage persistence
- **Reset Function**: Clear localStorage for testing

### 🎨 Design System Preview
- **Color Palette**: Visual display of all brand colors
- **Spacing Scale**: 8px-based spacing system visualization
- **Typography**: Font hierarchy and sizing examples

## 🔧 How to Use

### 1. **Interactive Testing**
- Click, type, and interact with components
- See real-time updates and validation
- Test different states and configurations

### 2. **Code Generation**
- Copy generated code snippets
- Use exact component syntax in your app
- Validate props and configurations

### 3. **Visual Validation**
- Compare component appearance
- Test responsive behavior
- Verify design system compliance

### 4. **State Management**
- Test different component states
- Verify error handling
- Check loading and empty states

## 🧪 Testing Scenarios

### Basic Component Testing
```vue
<template>
  <Icon name="search" size="md" />
  <Input v-model="value" label="Test" />
  <Modal v-model:open="isOpen" title="Test Modal">
    Content here
  </Modal>
</template>
```

### Advanced State Testing
```vue
<template>
  <!-- Test error states -->
  <Input 
    v-model="email" 
    type="email" 
    error="Invalid email format" 
  />
  
  <!-- Test disabled states -->
  <Input 
    model-value="Disabled" 
    disabled 
  />
  
  <!-- Test loading states -->
  <EmptyState 
    title="Loading..." 
    :loading="true" 
  />
</template>
```

## 📱 Mobile Testing

The component testing page is fully responsive:

1. **Open DevTools** (F12)
2. **Toggle Device Mode** (Ctrl+Shift+M)
3. **Select Device** (iPhone, iPad, etc.)
4. **Test Components** on different screen sizes

## 🎯 Best Practices

### 1. **Regular Testing**
- Test components after each change
- Verify all states and variations
- Check responsive behavior

### 2. **Code Validation**
- Use generated code snippets
- Verify prop types and requirements
- Test error handling

### 3. **Visual Consistency**
- Compare with design system
- Check spacing and colors
- Verify typography

### 4. **Accessibility Testing**
- Test keyboard navigation
- Verify focus management
- Check screen reader compatibility

## 🔄 Workflow Integration

### Development Workflow
1. **Develop Component** → Write component code
2. **Test Component** → Visit `/test/components`
3. **Iterate** → Make changes and test
4. **Validate** → Ensure all states work
5. **Deploy** → Component ready for production

### CI/CD Integration
The testing page can be used in automated testing:
- Screenshot testing
- Visual regression testing
- Accessibility audits

## 🚀 Advanced Features

### Custom Test Scenarios
You can extend the testing page with:
- Additional component variants
- Custom test data
- Integration with external APIs
- Performance testing

### Component Documentation
Each component section includes:
- Live examples
- Generated code
- Interactive controls
- State variations

## 📚 Alternative Testing Tools

While this built-in approach is simple and effective, you can also use:

- **Storybook**: More features but complex setup
- **Histoire**: Vite-native (if compatibility issues resolved)
- **Vitest**: Unit testing for component logic
- **Cypress**: E2E testing for full workflows

## 🛠️ Troubleshooting

### Common Issues

1. **Components not loading**: Ensure components are properly exported
2. **Styles not applied**: Check SCSS imports and Tailwind classes
3. **State not updating**: Verify reactive data binding
4. **Icons not showing**: Check icon name and size props

### Debug Tips
- Use browser DevTools
- Check console for errors
- Verify component props
- Test in isolation

## 🎉 Conclusion

This component testing system provides a **simple, effective, and integrated** way to test all your Vue 3 components. It's:

- ✅ **Fast**: No build process, instant feedback
- ✅ **Reliable**: Uses same config as main app
- ✅ **Comprehensive**: Tests all states and variations
- ✅ **Visual**: See components in action
- ✅ **Integrated**: Access to all app features

Happy testing! 🚀 