import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import {
  CheckCircle,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react-native';
import Header from '../components/Header';
import Card from '../components/Card';

// ============================================================================
// TYPE DEFINITIONS & MOCK DATA
// ============================================================================

interface HealthFacility {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  specialties: string[];
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface BookingData {
  facility: HealthFacility | null;
  date: string;
  timeSlot: TimeSlot | null;
  fullName: string;
  contactNumber: string;
  email: string;
  reason: string;
}

// Mock health facilities
const MOCK_FACILITIES: HealthFacility[] = [
  {
    id: '1',
    name: 'Naga City General Hospital',
    address: '123 Main St, Naga City',
    distance: '0.8 km',
    phone: '(+63) 54-123-4567',
    specialties: ['General Medicine', 'Pediatrics', 'Obstetrics'],
  },
  {
    id: '2',
    name: 'Green Clinic Naga',
    address: '456 Health Ave, Naga City',
    distance: '1.2 km',
    phone: '(+63) 54-234-5678',
    specialties: ['General Checkup', 'Family Medicine', 'Vaccination'],
  },
  {
    id: '3',
    name: 'Barangay Health Center - Tinago',
    address: 'Tinago, Naga City',
    distance: '0.5 km',
    phone: '(+63) 54-345-6789',
    specialties: ['Primary Care', 'Vaccination', 'Maternal Care'],
  },
  {
    id: '4',
    name: 'Sunshine Medical Clinic',
    address: '789 Wellness St, Naga City',
    distance: '1.5 km',
    phone: '(+63) 54-456-7890',
    specialties: ['Dermatology', 'General Practice', 'Dental'],
  },
];

// Mock time slots for selected date
const MOCK_TIME_SLOTS: TimeSlot[] = [
  { id: '1', time: '08:00 AM', available: true },
  { id: '2', time: '08:30 AM', available: false },
  { id: '3', time: '09:00 AM', available: true },
  { id: '4', time: '09:30 AM', available: true },
  { id: '5', time: '10:00 AM', available: false },
  { id: '6', time: '10:30 AM', available: true },
  { id: '7', time: '02:00 PM', available: true },
  { id: '8', time: '02:30 PM', available: false },
  { id: '9', time: '03:00 PM', available: true },
  { id: '10', time: '03:30 PM', available: true },
];

// Existing appointments to display
const MOCK_EXISTING_APPOINTMENTS = [
  { date: '2025-12-24', facility: 'City General Hospital', status: 'Confirmed' },
  { date: '2026-01-05', facility: 'Green Clinic', status: 'Pending' },
];

// ============================================================================
// STEP 1: SELECT FACILITY SCREEN
// ============================================================================

const FacilitySelectionScreen = ({
  onSelect,
}: {
  onSelect: (facility: HealthFacility) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFacilities = MOCK_FACILITIES.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Select Health Facility" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}>
        {/* Search Input */}
        <View className="mb-4 rounded-xl bg-slate-800 px-4 py-3">
          <TextInput
            placeholder="Search facility or location..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="text-white"
          />
        </View>

        {/* Facilities List */}
        {filteredFacilities.length === 0 ? (
          <View className="items-center justify-center py-12">
            <AlertCircle size={48} color="#64748b" />
            <Text className="mt-4 text-center text-slate-400">No facilities found</Text>
          </View>
        ) : (
          filteredFacilities.map((facility) => (
            <TouchableOpacity
              key={facility.id}
              onPress={() => onSelect(facility)}
              activeOpacity={0.7}
              className="mb-3 rounded-xl bg-slate-800 p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="mb-1 text-base font-semibold text-white">{facility.name}</Text>
                  <View className="mb-2 flex-row items-center gap-1">
                    <MapPin size={14} color="#22c55e" />
                    <Text className="text-xs text-slate-300">{facility.address}</Text>
                  </View>
                  <View className="mb-2 flex-row items-center gap-1">
                    <Clock size={14} color="#06b6d4" />
                    <Text className="text-xs text-slate-400">Distance: {facility.distance}</Text>
                  </View>
                  <View className="flex-row flex-wrap gap-1">
                    {facility.specialties.map((spec) => (
                      <View key={spec} className="rounded-full bg-primary/20 px-2 py-1">
                        <Text className="text-xs font-medium text-cyan-300">{spec}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <Text className="mt-3 text-xs text-slate-400">📞 {facility.phone}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STEP 2: SELECT DATE & TIME SCREEN
// ============================================================================

const DateTimeSelectionScreen = ({
  facility,
  onSelectDateTime,
  onBack,
}: {
  facility: HealthFacility;
  onSelectDateTime: (date: string, timeSlot: TimeSlot) => void;
  onBack: () => void;
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Generate next 7 days for selection
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const day = date.getDate();
      days.push({ dateStr, dayName, day });
    }
    return days;
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTimeSlot(null);
    // Simulate loading slots
    setIsLoadingSlots(true);
    setTimeout(() => setIsLoadingSlots(false), 500);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTimeSlot) return;
    onSelectDateTime(selectedDate, selectedTimeSlot);
  };

  const isDateSelected = selectedDate && selectedTimeSlot;

  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Choose Date & Time" />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Facility Info Card */}
        <Card>
          <Text className="font-semibold text-white">{facility.name}</Text>
          <Text className="mt-1 text-xs text-slate-400">{facility.address}</Text>
        </Card>

        {/* Date Selection */}
        <Text className="mb-3 mt-4 text-sm font-semibold text-white">Select Date</Text>
        <FlatList
          scrollEnabled={false}
          data={getNextDays()}
          keyExtractor={(item) => item.dateStr}
          numColumns={4}
          columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleDateSelect(item.dateStr)}
              activeOpacity={0.7}
              className={`flex-1 items-center rounded-lg border-2 py-2 ${
                selectedDate === item.dateStr
                  ? 'border-cyan-400 bg-cyan-400/10'
                  : 'border-slate-700 bg-slate-800'
              }`}>
              <Text className="text-xs font-medium text-slate-300">{item.dayName}</Text>
              <Text className="text-lg font-bold text-white">{item.day}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Time Slots */}
        {selectedDate && (
          <View className="mt-6">
            <Text className="mb-3 text-sm font-semibold text-white">Select Time</Text>
            {isLoadingSlots ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text className="mt-2 text-slate-400">Loading available slots...</Text>
              </View>
            ) : (
              <View>
                <FlatList
                  scrollEnabled={false}
                  data={MOCK_TIME_SLOTS}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => item.available && setSelectedTimeSlot(item)}
                      disabled={!item.available}
                      activeOpacity={0.7}
                      className={`flex-1 items-center rounded-lg border-2 py-3 ${
                        !item.available
                          ? 'border-slate-700 bg-slate-900 opacity-50'
                          : selectedTimeSlot?.id === item.id
                            ? 'border-green-400 bg-green-400/10'
                            : 'border-slate-700 bg-slate-800'
                      }`}>
                      <Text
                        className={`font-medium ${
                          !item.available
                            ? 'text-slate-500'
                            : selectedTimeSlot?.id === item.id
                              ? 'text-green-400'
                              : 'text-white'
                        }`}>
                        {item.time}
                      </Text>
                      {!item.available && (
                        <Text className="mt-1 text-xs text-slate-500">Booked</Text>
                      )}
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="flex-row gap-3 border-t border-slate-800 bg-[#0b1220] px-4 py-4">
        <TouchableOpacity
          onPress={onBack}
          className="flex-1 items-center rounded-lg border-2 border-slate-700 py-3">
          <Text className="font-semibold text-white">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!isDateSelected}
          activeOpacity={0.7}
          className={`flex-1 items-center rounded-lg py-3 ${
            isDateSelected ? 'bg-cyan-500' : 'bg-slate-700'
          }`}>
          <Text className="font-semibold text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// STEP 3: ENTER PATIENT DETAILS SCREEN
// ============================================================================

const PatientDetailsScreen = ({
  facility,
  date,
  timeSlot,
  onSubmit,
  onBack,
}: {
  facility: HealthFacility;
  date: string;
  timeSlot: TimeSlot;
  onSubmit: (data: Omit<BookingData, 'facility' | 'date' | 'timeSlot'>) => void;
  onBack: () => void;
}) => {
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(contactNumber)) {
      newErrors.contactNumber = 'Invalid phone number';
    }
    if (!reason.trim()) {
      newErrors.reason = 'Reason for visit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        fullName: fullName.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim(),
        reason: reason.trim(),
      });
    }
  };

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0b1220]">
      <Header title="Patient Details" />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Summary Card */}
        <Card title="Appointment Summary">
          <View className="space-y-2">
            <View className="flex-row gap-2">
              <MapPin size={16} color="#22c55e" />
              <Text className="flex-1 text-sm text-slate-300">{facility.name}</Text>
            </View>
            <View className="flex-row gap-2">
              <Calendar size={16} color="#06b6d4" />
              <Text className="text-sm text-slate-300">{formattedDate}</Text>
            </View>
            <View className="flex-row gap-2">
              <Clock size={16} color="#f59e0b" />
              <Text className="text-sm text-slate-300">{timeSlot.time}</Text>
            </View>
          </View>
        </Card>

        {/* Patient Details Form */}
        <Text className="mb-3 mt-6 text-sm font-semibold text-white">Your Information</Text>

        {/* Full Name */}
        <View className="mb-4">
          <View className="flex-row items-center gap-2 rounded-lg bg-slate-800 px-3 py-2">
            <User size={18} color="#94a3b8" />
            <TextInput
              placeholder="Full Name *"
              placeholderTextColor="#64748b"
              value={fullName}
              onChangeText={setFullName}
              className="flex-1 text-white"
              editable={true}
            />
          </View>
          {errors.fullName && <Text className="mt-1 text-xs text-red-400">{errors.fullName}</Text>}
        </View>

        {/* Contact Number */}
        <View className="mb-4">
          <View className="flex-row items-center gap-2 rounded-lg bg-slate-800 px-3 py-2">
            <Phone size={18} color="#94a3b8" />
            <TextInput
              placeholder="Contact Number *"
              placeholderTextColor="#64748b"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
              className="flex-1 text-white"
            />
          </View>
          {errors.contactNumber && (
            <Text className="mt-1 text-xs text-red-400">{errors.contactNumber}</Text>
          )}
        </View>

        {/* Email (Optional) */}
        <View className="mb-4">
          <TextInput
            placeholder="Email (optional)"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            className="rounded-lg bg-slate-800 px-3 py-3 text-white"
          />
        </View>

        {/* Reason for Visit */}
        <View className="mb-4">
          <TextInput
            placeholder="Reason for Visit *"
            placeholderTextColor="#64748b"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            className="rounded-lg bg-slate-800 px-3 py-3 text-white"
          />
          {errors.reason && <Text className="mt-1 text-xs text-red-400">{errors.reason}</Text>}
        </View>

        {/* Information */}
        <View className="rounded-lg bg-blue-900/20 px-3 py-2">
          <Text className="text-xs text-blue-300">
            ℹ️ We'll use your information to confirm your appointment and send you updates via SMS
            or email.
          </Text>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="flex-row gap-3 border-t border-slate-800 bg-[#0b1220] px-4 py-4">
        <TouchableOpacity
          onPress={onBack}
          className="flex-1 items-center rounded-lg border-2 border-slate-700 py-3">
          <Text className="font-semibold text-white">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.7}
          className="flex-1 items-center rounded-lg bg-cyan-500 py-3">
          <Text className="font-semibold text-white">Review Booking</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ============================================================================
// STEP 4: REVIEW BOOKING SCREEN
// ============================================================================

const ReviewBookingScreen = ({
  booking,
  onConfirm,
  onBack,
  isSubmitting,
}: {
  booking: BookingData;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}) => {
  const dateObj = new Date(booking.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    weekday: 'long',
  });

  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Review Appointment" />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Facility Card */}
        <Card title="Facility">
          <View className="space-y-2">
            <Text className="text-base font-semibold text-white">{booking.facility?.name}</Text>
            <Text className="text-xs text-slate-400">{booking.facility?.address}</Text>
            <Text className="mt-2 text-xs text-slate-400">📞 {booking.facility?.phone}</Text>
          </View>
        </Card>

        {/* Appointment Details Card */}
        <Card title="Appointment Details">
          <View className="space-y-3">
            <View className="flex-row items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
              <View className="flex-row items-center gap-2">
                <Calendar size={16} color="#06b6d4" />
                <Text className="text-sm text-slate-300">Date</Text>
              </View>
              <Text className="font-semibold text-white">{formattedDate}</Text>
            </View>
            <View className="flex-row items-center justify-between rounded-lg bg-slate-800 px-3 py-2">
              <View className="flex-row items-center gap-2">
                <Clock size={16} color="#f59e0b" />
                <Text className="text-sm text-slate-300">Time</Text>
              </View>
              <Text className="font-semibold text-white">{booking.timeSlot?.time}</Text>
            </View>
          </View>
        </Card>

        {/* Patient Information Card */}
        <Card title="Patient Information">
          <View className="space-y-3">
            <View>
              <Text className="text-xs font-medium text-slate-400">Full Name</Text>
              <Text className="mt-1 text-base font-semibold text-white">{booking.fullName}</Text>
            </View>
            <View>
              <Text className="text-xs font-medium text-slate-400">Contact Number</Text>
              <Text className="mt-1 text-base text-white">{booking.contactNumber}</Text>
            </View>
            {booking.email && (
              <View>
                <Text className="text-xs font-medium text-slate-400">Email</Text>
                <Text className="mt-1 text-base text-white">{booking.email}</Text>
              </View>
            )}
            <View>
              <Text className="text-xs font-medium text-slate-400">Reason for Visit</Text>
              <Text className="mt-1 text-base text-white">{booking.reason}</Text>
            </View>
          </View>
        </Card>

        {/* Note */}
        <View className="mt-4 rounded-lg bg-green-900/20 px-3 py-2">
          <Text className="text-xs text-green-300">
            ✓ A confirmation message will be sent to your contact number and email.
          </Text>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="flex-row gap-3 border-t border-slate-800 bg-[#0b1220] px-4 py-4">
        <TouchableOpacity
          onPress={onBack}
          disabled={isSubmitting}
          className="flex-1 items-center rounded-lg border-2 border-slate-700 py-3">
          <Text className="font-semibold text-white">Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onConfirm}
          disabled={isSubmitting}
          activeOpacity={0.7}
          className={`flex-1 flex-row items-center justify-center rounded-lg py-3 ${
            isSubmitting ? 'bg-slate-700' : 'bg-green-500'
          }`}>
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text className="ml-2 font-semibold text-white">Confirming...</Text>
            </>
          ) : (
            <Text className="font-semibold text-white">Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ============================================================================
// STEP 5: SUCCESS SCREEN
// ============================================================================

const SuccessScreen = ({ booking, onDone }: { booking: BookingData; onDone: () => void }) => {
  const dateObj = new Date(booking.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <SafeAreaView className="flex-1 bg-[#0b1220]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, justifyContent: 'center' }}>
        {/* Success Icon */}
        <View className="items-center">
          <View className="items-center justify-center rounded-full bg-green-500/20 p-6">
            <CheckCircle size={80} color="#22c55e" strokeWidth={1.5} />
          </View>

          {/* Success Message */}
          <Text className="mt-6 text-center text-2xl font-bold text-white">Booking Confirmed!</Text>
          <Text className="mt-2 text-center text-slate-400">
            Your appointment has been successfully scheduled.
          </Text>

          {/* Appointment Summary */}
          <Card>
            <View className="mt-6 space-y-4">
              <View className="rounded-lg bg-slate-800 p-3">
                <Text className="text-xs font-medium text-slate-400">FACILITY</Text>
                <Text className="mt-1 font-semibold text-white">{booking.facility?.name}</Text>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 rounded-lg bg-slate-800 p-3">
                  <Text className="text-xs font-medium text-slate-400">DATE</Text>
                  <Text className="mt-1 font-semibold text-white">{formattedDate}</Text>
                </View>
                <View className="flex-1 rounded-lg bg-slate-800 p-3">
                  <Text className="text-xs font-medium text-slate-400">TIME</Text>
                  <Text className="mt-1 font-semibold text-white">{booking.timeSlot?.time}</Text>
                </View>
              </View>

              <View className="rounded-lg bg-slate-800 p-3">
                <Text className="text-xs font-medium text-slate-400">PATIENT</Text>
                <Text className="mt-1 font-semibold text-white">{booking.fullName}</Text>
              </View>

              <View className="mt-4 space-y-2 rounded-lg bg-blue-900/20 p-3">
                <Text className="text-xs font-semibold text-blue-300">📋 What's Next?</Text>
                <Text className="text-xs text-blue-200">
                  {`• A confirmation SMS will be sent to ${booking.contactNumber}\n`}
                  {booking.email ? `• Confirmation email sent to ${booking.email}\n` : ''}
                  {`• Arrive 10 minutes early\n`}
                  {`• Bring valid ID and health insurance`}
                </Text>
              </View>
            </View>
          </Card>

          {/* Contact Info */}
          <View className="mt-6 w-full rounded-lg bg-slate-800 p-4">
            <Text className="font-semibold text-white">Need Help?</Text>
            <Text className="mt-2 text-xs text-slate-400">
              Call {booking.facility?.phone} to reschedule or cancel
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Done Button */}
      <View className="border-t border-slate-800 bg-[#0b1220] px-4 py-4">
        <TouchableOpacity
          onPress={onDone}
          activeOpacity={0.7}
          className="items-center rounded-lg bg-cyan-500 py-3">
          <Text className="font-semibold text-white">Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ============================================================================
// MAIN APPOINTMENTS SCREEN COMPONENT
// ============================================================================

export default function AppointmentsScreen() {
  // Booking flow state
  const [bookingStep, setBookingStep] = useState<
    'list' | 'facility-select' | 'datetime-select' | 'patient-details' | 'review' | 'success'
  >('list');

  const [booking, setBooking] = useState<BookingData>({
    facility: null,
    date: '',
    timeSlot: null,
    fullName: '',
    contactNumber: '',
    email: '',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // Handler Functions
  // ============================================================================

  const handleStartBooking = () => {
    setBooking({
      facility: null,
      date: '',
      timeSlot: null,
      fullName: '',
      contactNumber: '',
      email: '',
      reason: '',
    });
    setBookingStep('facility-select');
  };

  const handleFacilitySelect = (facility: HealthFacility) => {
    setBooking({ ...booking, facility });
    setBookingStep('datetime-select');
  };

  const handleSelectDateTime = (date: string, timeSlot: TimeSlot) => {
    setBooking({ ...booking, date, timeSlot });
    setBookingStep('patient-details');
  };

  const handlePatientDetailsSubmit = (
    details: Omit<BookingData, 'facility' | 'date' | 'timeSlot'>
  ) => {
    setBooking({ ...booking, ...details });
    setBookingStep('review');
  };

  const handleConfirmBooking = () => {
    setIsSubmitting(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      setBookingStep('success');
    }, 1500);
  };

  const handleSuccessDone = () => {
    setBookingStep('list');
  };

  // ============================================================================
  // Render Different Steps
  // ============================================================================

  if (bookingStep === 'facility-select') {
    return <FacilitySelectionScreen onSelect={handleFacilitySelect} />;
  }

  if (bookingStep === 'datetime-select' && booking.facility) {
    return (
      <DateTimeSelectionScreen
        facility={booking.facility}
        onSelectDateTime={handleSelectDateTime}
        onBack={() => setBookingStep('facility-select')}
      />
    );
  }

  if (bookingStep === 'patient-details' && booking.facility && booking.date && booking.timeSlot) {
    return (
      <PatientDetailsScreen
        facility={booking.facility}
        date={booking.date}
        timeSlot={booking.timeSlot}
        onSubmit={handlePatientDetailsSubmit}
        onBack={() => setBookingStep('datetime-select')}
      />
    );
  }

  if (bookingStep === 'review' && booking.facility && booking.date && booking.timeSlot) {
    return (
      <ReviewBookingScreen
        booking={booking}
        onConfirm={handleConfirmBooking}
        onBack={() => setBookingStep('patient-details')}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (bookingStep === 'success' && booking.facility && booking.date && booking.timeSlot) {
    return <SuccessScreen booking={booking} onDone={handleSuccessDone} />;
  }

  // ============================================================================
  // DEFAULT: APPOINTMENTS LIST SCREEN
  // ============================================================================

  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Appointments" />
      <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Section: Upcoming Appointments */}
        {MOCK_EXISTING_APPOINTMENTS.length > 0 && (
          <>
            <Text className="mb-3 text-sm font-semibold text-white">Upcoming Appointments</Text>
            {MOCK_EXISTING_APPOINTMENTS.map((appointment) => (
              <View key={appointment.date} className="mb-3">
                <Card>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold text-white">{appointment.facility}</Text>
                      <Text className="mt-1 text-xs text-slate-400">
                        📅{' '}
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View
                      className={`rounded-full px-3 py-1 ${
                        appointment.status === 'Confirmed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
                      }`}>
                      <Text
                        className={`text-xs font-medium ${
                          appointment.status === 'Confirmed' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                        {appointment.status}
                      </Text>
                    </View>
                  </View>
                </Card>
              </View>
            ))}
          </>
        )}

        {/* Empty State or Call to Action */}
        <View className="mt-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 px-4 py-6">
          <Text className="text-center text-sm font-semibold text-white">
            Ready to schedule an appointment?
          </Text>
          <Text className="mt-2 text-center text-xs text-slate-400">
            Book a consultation with any of our partner health facilities
          </Text>
        </View>

        {/* Book Appointment Button */}
        <TouchableOpacity
          onPress={handleStartBooking}
          activeOpacity={0.7}
          className="mt-4 items-center rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 py-4">
          <Text className="text-base font-semibold text-white">Book an Appointment</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View className="mt-6 rounded-lg bg-slate-800/50 px-4 py-3">
          <Text className="text-xs font-medium text-slate-300">ℹ️ About Our Service</Text>
          <Text className="mt-2 text-xs text-slate-400">
            • Connect with certified health facilities across Naga City{'\n'}• Real-time
            availability and instant confirmation{'\n'}• Easy rescheduling and cancellation{'\n'}•
            Secure patient data handling
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
