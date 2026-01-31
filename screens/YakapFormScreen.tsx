// ============================================================================
// YAKAP FORM SCREEN - PhilHealth Konsulta Registration Form
// Multi-step modern form with progress indicator
// ============================================================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  MapPin,
  CreditCard,
  Check,
  ChevronDown,
  X,
} from 'lucide-react-native';
import { yakapService, YakapFormData } from '../services/yakapService';
import { authService } from '../services/authService';

type Step = 1 | 2 | 3 | 4;

// Options
const SEX_OPTIONS = ['Male', 'Female'];
const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'];
const EMPLOYMENT_STATUS_OPTIONS = ['Employed', 'Self-Employed', 'Unemployed', 'Student', 'Retired'];
const EDUCATIONAL_ATTAINMENT_OPTIONS = [
  'Elementary', 'High School', 'Vocational', "Bachelor's Degree", "Master's Degree", 'Doctorate'
];
const MEMBERSHIP_TYPE_OPTIONS = ['Member', 'Dependent', 'Non-Member'];
const BLOOD_TYPE_OPTIONS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const INDIGENOUS_OPTIONS = ['Yes', 'No'];

// Barangays in Naga City
const BARANGAYS = [
  'Abella', 'Bagumbayan Norte', 'Bagumbayan Sur', 'Balatas', 'Calauag',
  'Cararayan', 'Carolina', 'Concepcion Grande', 'Concepcion Pequeña', 'Dayangdang',
  'Del Rosario', 'Dinaga', 'Igualdad Interior', 'Lerma', 'Liboton',
  'Mabolo', 'Pacol', 'Panicuason', 'Peñafrancia', 'Sabang',
  'San Felipe', 'San Francisco', 'San Isidro', 'Santa Cruz', 'Tabuco',
  'Tinago', 'Triangulo',
];

// ============================================================================
// STANDALONE FORM INPUT - Defined outside to prevent keyboard dismiss
// ============================================================================
interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'words' | 'sentences';
  hasError?: boolean;
  errorMessage?: string;
}

const FormInputComponent = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'words',
  hasError,
  errorMessage,
}: FormInputProps) => (
  <View className="mb-4">
    <Text className="text-slate-400 text-xs mb-1.5 ml-1">{label}</Text>
    <TextInput
      className={`bg-slate-800/50 rounded-xl px-4 py-3 text-white border ${
        hasError ? 'border-red-500' : 'border-slate-700'
      }`}
      placeholder={placeholder || label}
      placeholderTextColor="#64748b"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
    {hasError && errorMessage && (
      <Text className="text-red-400 text-xs mt-1 ml-1">{errorMessage}</Text>
    )}
  </View>
);

// ============================================================================
// STANDALONE FORM SELECT - Defined outside to prevent issues
// ============================================================================
interface FormSelectProps {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

const FormSelectComponent = ({
  label,
  value,
  options,
  placeholder,
  isOpen,
  onToggle,
  onSelect,
  hasError,
  errorMessage,
}: FormSelectProps) => (
  <View className="mb-4">
    <Text className="text-slate-400 text-xs mb-1.5 ml-1">{label}</Text>
    <TouchableOpacity
      onPress={onToggle}
      className={`bg-slate-800/50 rounded-xl px-4 py-3 border flex-row items-center justify-between ${
        hasError ? 'border-red-500' : 'border-slate-700'
      }`}
    >
      <Text className={value ? 'text-white' : 'text-slate-500'}>
        {value || placeholder || `Select ${label}`}
      </Text>
      <ChevronDown size={18} {...{ color: '#64748b' }} />
    </TouchableOpacity>
    
    {isOpen && (
      <View className="mt-2 bg-slate-800 rounded-xl border border-slate-700 max-h-40">
        <ScrollView nestedScrollEnabled>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => onSelect(option)}
              className={`px-4 py-3 border-b border-slate-700/50 ${
                value === option ? 'bg-cyan-600/20' : ''
              }`}
            >
              <Text className={value === option ? 'text-cyan-400' : 'text-white'}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )}
    {hasError && errorMessage && (
      <Text className="text-red-400 text-xs mt-1 ml-1">{errorMessage}</Text>
    )}
  </View>
);


export default function YakapFormScreen() {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [activePicker, setActivePicker] = useState<string | null>(null);

  // Close handler
  const onClose = () => navigation.goBack();
  const onSuccess = () => navigation.goBack();

  // Form data
  const [formData, setFormData] = useState<YakapFormData>({
    // Personal Info
    philhealthNo: '',
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    sex: '',
    age: '',
    birthdate: '',
    birthPlace: '',
    civilStatus: '',
    maidenLastName: '',
    maidenMiddleName: '',
    educationalAttainment: '',
    employmentStatus: '',
    occupation: '',
    religion: '',
    indigenous: '',
    bloodType: '',
    
    // Family Info
    motherFirstName: '',
    motherLastName: '',
    motherMiddleName: '',
    motherBirthdate: '',
    fatherFirstName: '',
    fatherLastName: '',
    fatherMiddleName: '',
    fatherBirthdate: '',
    spouseFirstName: '',
    spouseLastName: '',
    spouseBirthdate: '',
    
    // Address & Contact
    streetAddress: '',
    province: 'Camarines Sur',
    cityMunicipality: 'Naga City',
    barangay: '',
    email: '',
    mobile: '',
    
    // Membership
    membershipType: '',
    firstChoiceKPP: '',
    secondChoiceKPP: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form field
  const updateField = (field: keyof YakapFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    const fieldKey = field as string;
    if (errors[fieldKey]) {
      setErrors({ ...errors, [fieldKey]: '' });
    }
  };

  // Validation per step
  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.lastName.trim()) newErrors.lastName = 'Required';
      if (!formData.firstName.trim()) newErrors.firstName = 'Required';
      if (!formData.sex) newErrors.sex = 'Required';
      if (!formData.birthdate) newErrors.birthdate = 'Required';
      if (!formData.civilStatus) newErrors.civilStatus = 'Required';
    } else if (step === 2) {
      // Family info is optional for now
    } else if (step === 3) {
      if (!formData.barangay) newErrors.barangay = 'Required';
      if (!formData.mobile.trim()) newErrors.mobile = 'Required';
      else if (!/^(09|\+639)\d{9}$/.test(formData.mobile.replace(/\s/g, ''))) {
        newErrors.mobile = 'Invalid mobile number';
      }
    } else if (step === 4) {
      if (!formData.membershipType) newErrors.membershipType = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const goNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep((currentStep + 1) as Step);
      } else {
        handleSubmit();
      }
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    } else {
      onClose();
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);
    try {
      const resident = authService.getCurrentResident();
      if (!resident) {
        Alert.alert('Error', 'You must be logged in to submit this form');
        return;
      }

      const result = await yakapService.submitApplication(formData, resident.id);

      if (result.success) {
        Alert.alert(
          'Application Submitted! 🎉',
          'Your PhilHealth Konsulta (Yakap) application has been submitted for review. You will be notified once it\'s processed.',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Submission Failed', result.error || 'Please try again');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for the standalone components
  const renderInput = (
    label: string,
    field: keyof YakapFormData,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
      autoCapitalize?: 'none' | 'words' | 'sentences';
    }
  ) => {
    const fieldKey = field as string;
    return (
      <FormInputComponent
        label={label}
        value={formData[field]}
        onChangeText={(text) => updateField(field, text)}
        placeholder={options?.placeholder}
        keyboardType={options?.keyboardType}
        autoCapitalize={options?.autoCapitalize}
        hasError={!!errors[fieldKey]}
        errorMessage={errors[fieldKey]}
      />
    );
  };

  const renderSelect = (
    label: string,
    field: keyof YakapFormData,
    options: string[],
    placeholder?: string
  ) => {
    const fieldKey = field as string;
    return (
      <FormSelectComponent
        label={label}
        value={formData[field]}
        options={options}
        placeholder={placeholder}
        isOpen={activePicker === fieldKey}
        onToggle={() => setActivePicker(activePicker === fieldKey ? null : fieldKey)}
        onSelect={(value) => {
          updateField(field, value);
          setActivePicker(null);
        }}
        hasError={!!errors[fieldKey]}
        errorMessage={errors[fieldKey]}
      />
    );
  };

  // Step indicator
  const StepIndicator = () => (
    <View className="flex-row items-center justify-center py-4">
      {[1, 2, 3, 4].map((step, index) => (
        <React.Fragment key={step}>
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${
              step === currentStep
                ? 'bg-cyan-600'
                : step < currentStep
                  ? 'bg-green-600'
                  : 'bg-slate-700'
            }`}
          >
            {step < currentStep ? (
              <Check size={18} {...{ color: 'white' }} />
            ) : (
              <Text className="text-white font-bold">{step}</Text>
            )}
          </View>
          {index < 3 && (
            <View
              className={`w-8 h-1 ${
                step < currentStep ? 'bg-green-600' : 'bg-slate-700'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  // Step titles
  const stepTitles = {
    1: { title: 'Personal Information', icon: User },
    2: { title: 'Family Information', icon: Users },
    3: { title: 'Address & Contact', icon: MapPin },
    4: { title: 'Membership Type', icon: CreditCard },
  };

  const StepIcon = stepTitles[currentStep].icon;

  return (
    <View className="flex-1 bg-[#0b1220]">
      {/* Header */}
      <View className="bg-slate-900/50 border-b border-slate-800 pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={goBack}
            className="p-2 -ml-2"
          >
            <ArrowLeft size={24} {...{ color: 'white' }} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 -mr-2"
          >
            <X size={24} {...{ color: '#64748b' }} />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-cyan-600/20 items-center justify-center mr-3">
            <StepIcon size={24} {...{ color: '#06b6d4' }} />
          </View>
          <View>
            <Text className="text-white text-xl font-bold">
              Yakap Application
            </Text>
            <Text className="text-slate-400 text-sm">
              {stepTitles[currentStep].title}
            </Text>
          </View>
        </View>

        <StepIndicator />
      </View>

      {/* Form Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {currentStep === 1 && (
            // STEP 1: Personal Information
            <>
              {renderInput('PhilHealth No. (Optional)', 'philhealthNo', { autoCapitalize: 'none' })}
              
              <View className="flex-row gap-2">
                <View className="flex-1">
                  {renderInput('Last Name *', 'lastName')}
                </View>
                <View className="flex-1">
                  {renderInput('First Name *', 'firstName')}
                </View>
              </View>
              
              <View className="flex-row gap-2">
                <View className="flex-1">
                  {renderInput('Middle Name', 'middleName')}
                </View>
                <View className="w-24">
                  {renderInput('Suffix', 'suffix', { placeholder: 'Jr, Sr, III' })}
                </View>
              </View>
              
              <View className="flex-row gap-2">
                <View className="flex-1">
                  {renderSelect('Sex *', 'sex', SEX_OPTIONS)}
                </View>
                <View className="flex-1">
                  {renderInput('Age', 'age', { keyboardType: 'numeric', autoCapitalize: 'none' })}
                </View>
              </View>
              
              {renderInput('Birthdate * (YYYY-MM-DD)', 'birthdate', { autoCapitalize: 'none' })}
              {renderInput('Birth Place', 'birthPlace')}
              {renderSelect('Civil Status *', 'civilStatus', CIVIL_STATUS_OPTIONS)}
              
              {formData.civilStatus === 'Married' && (
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    {renderInput('Maiden Last Name', 'maidenLastName')}
                  </View>
                  <View className="flex-1">
                    {renderInput('Maiden Middle Name', 'maidenMiddleName')}
                  </View>
                </View>
              )}
              
              {renderSelect('Educational Attainment', 'educationalAttainment', EDUCATIONAL_ATTAINMENT_OPTIONS)}
              {renderSelect('Employment Status', 'employmentStatus', EMPLOYMENT_STATUS_OPTIONS)}
              
              {(formData.employmentStatus === 'Employed' || formData.employmentStatus === 'Self-Employed') && (
                renderInput('Occupation', 'occupation')
              )}
              
              {renderInput('Religion', 'religion')}
              {renderSelect('Indigenous', 'indigenous', INDIGENOUS_OPTIONS)}
              {renderSelect('Blood Type', 'bloodType', BLOOD_TYPE_OPTIONS)}
            </>
          )}

          {currentStep === 2 && (
            // STEP 2: Family Information
            <>
              <Text className="text-cyan-400 font-semibold mb-4 text-sm">Mother's Information</Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  {renderInput('First Name', 'motherFirstName')}
                </View>
                <View className="flex-1">
                  {renderInput('Last Name', 'motherLastName')}
                </View>
              </View>
              {renderInput('Middle Name', 'motherMiddleName')}
              {renderInput('Birthdate (YYYY-MM-DD)', 'motherBirthdate', { autoCapitalize: 'none' })}
              
              <Text className="text-cyan-400 font-semibold mb-4 mt-4 text-sm">Father's Information</Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  {renderInput('First Name', 'fatherFirstName')}
                </View>
                <View className="flex-1">
                  {renderInput('Last Name', 'fatherLastName')}
                </View>
              </View>
              {renderInput('Middle Name', 'fatherMiddleName')}
              {renderInput('Birthdate (YYYY-MM-DD)', 'fatherBirthdate', { autoCapitalize: 'none' })}
              
              {formData.civilStatus === 'Married' && (
                <>
                  <Text className="text-cyan-400 font-semibold mb-4 mt-4 text-sm">Spouse's Information</Text>
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      {renderInput('First Name', 'spouseFirstName')}
                    </View>
                    <View className="flex-1">
                      {renderInput('Last Name', 'spouseLastName')}
                    </View>
                  </View>
                  {renderInput('Birthdate (YYYY-MM-DD)', 'spouseBirthdate', { autoCapitalize: 'none' })}
                </>
              )}
            </>
          )}

          {currentStep === 3 && (
            // STEP 3: Address & Contact
            <>
              {renderInput('Number/Street Name', 'streetAddress')}
              {renderInput('Province', 'province')}
              {renderInput('City/Municipality', 'cityMunicipality')}
              {renderSelect('Barangay *', 'barangay', BARANGAYS)}
              {renderInput('Email Address', 'email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
              {renderInput('Mobile Number *', 'mobile', { placeholder: '09XXXXXXXXX', keyboardType: 'phone-pad', autoCapitalize: 'none' })}
            </>
          )}

          {currentStep === 4 && (
            // STEP 4: Membership Type
            <>
              <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 mb-6">
                <Text className="text-white font-semibold mb-2">Membership Type</Text>
                <Text className="text-slate-400 text-sm mb-4">
                  Select your PhilHealth membership category
                </Text>
                
                {MEMBERSHIP_TYPE_OPTIONS.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateField('membershipType', type)}
                    className={`flex-row items-center p-4 rounded-xl mb-2 border ${
                      formData.membershipType === type
                        ? 'bg-cyan-600/20 border-cyan-500'
                        : 'bg-slate-700/30 border-slate-600'
                    }`}
                  >
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                        formData.membershipType === type
                          ? 'border-cyan-500 bg-cyan-500'
                          : 'border-slate-500'
                      }`}
                    >
                      {formData.membershipType === type && (
                        <Check size={14} {...{ color: 'white' }} />
                      )}
                    </View>
                    <View>
                      <Text className="text-white font-medium">{type}</Text>
                      <Text className="text-slate-400 text-xs">
                        {type === 'Member' && 'Direct PhilHealth member'}
                        {type === 'Dependent' && 'Dependent of a member'}
                        {type === 'Non-Member' && 'Not yet a PhilHealth member'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {errors.membershipType && (
                  <Text className="text-red-400 text-xs mt-1">{errors.membershipType}</Text>
                )}
              </View>

              {renderInput('1st Choice KPP (Health Provider)', 'firstChoiceKPP', { placeholder: 'Enter preferred health provider' })}
              {renderInput('2nd Choice KPP (Health Provider)', 'secondChoiceKPP', { placeholder: 'Enter alternative health provider' })}

              {/* Consent */}
              <View className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700 mt-4">
                <Text className="text-slate-300 text-xs leading-5">
                  By submitting this form, I hereby certify that I did not avail of FPE in other KPP. 
                  Moreover, I grant my free and voluntary consent to the collection, transmission and 
                  processing of my personal data and health records to PhilHealth for the purpose of 
                  paying and monitoring the provider for the Konsulta benefit in accordance with 
                  Republic Act No. 10173, otherwise known as the "Data Privacy Act of 2012".
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 p-4 pb-8">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={goBack}
            className="flex-1 bg-slate-700 rounded-2xl py-4 flex-row items-center justify-center"
          >
            <ArrowLeft size={18} {...{ color: 'white' }} />
            <Text className="text-white font-semibold ml-2">
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={goNext}
            disabled={isLoading}
            className="flex-1 bg-cyan-600 rounded-2xl py-4 flex-row items-center justify-center"
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white font-semibold mr-2">
                  {currentStep === 4 ? 'Submit' : 'Next'}
                </Text>
                {currentStep === 4 ? (
                  <Check size={18} {...{ color: 'white' }} />
                ) : (
                  <ArrowRight size={18} {...{ color: 'white' }} />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
