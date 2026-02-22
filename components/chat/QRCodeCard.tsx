// ============================================================================
// QR CODE CARD - Resident Identity QR Code Display
// Displays a scannable QR code for the resident's health profile
// Format: JSON payload containing resident ID for CMS lookup
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Share,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Shield, X, Share2, QrCode, ChevronDown, ChevronUp } from 'lucide-react-native';
import { QRResidentPayload } from '../../types/aramon';

// ============================================================================
// TYPES
// ============================================================================

interface QRCodeCardProps {
  residentData: QRResidentPayload;
}

// ============================================================================
// QR PAYLOAD BUILDER
// Health workers scanning this get the resident ID to query the CMS
// ============================================================================

const buildQRPayload = (data: QRResidentPayload): string => {
  return JSON.stringify({
    type: 'nagacare_resident',
    v: 1,
    id: data.residentId,
    name: data.name,
    barangay: data.barangay,
  });
};

// ============================================================================
// FIELD ROW
// ============================================================================

const FieldRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  if (!value) return null;
  return (
    <View className="flex-row justify-between py-2 border-b border-slate-700/40">
      <Text className="text-slate-400 text-xs">{label}</Text>
      <Text className="text-white text-xs font-medium ml-2 flex-1 text-right">{value}</Text>
    </View>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const QRCodeCard: React.FC<QRCodeCardProps> = ({ residentData }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const qrPayload = buildQRPayload(residentData);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `NagaCare Health ID\nName: ${residentData.name}\nBarangay: ${residentData.barangay}, Purok ${residentData.purok}\nResident ID: ${residentData.residentId}`,
        title: 'My NagaCare Health QR Code',
      });
    } catch {
      // silently ignore share errors
    }
  };

  return (
    <>
      {/* ── Compact Card ── */}
      <View
        className="rounded-2xl overflow-hidden mb-2"
        style={{
          backgroundColor: '#131c2e',
          borderWidth: 1,
          borderColor: 'rgba(249, 115, 22, 0.25)',
        }}
      >
        {/* Header */}
        <View
          className="px-4 pt-4 pb-3 flex-row items-center"
          style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(249, 115, 22, 0.15)' }}
        >
          <View
            className="w-9 h-9 rounded-xl items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)' }}
          >
            <QrCode size={18} color="#f97316" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-bold">Health ID QR Code</Text>
            <Text className="text-slate-400 text-xs mt-0.5">Tap to view full screen</Text>
          </View>
          <View
            className="px-2.5 py-1 rounded-full flex-row items-center"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
          >
            <Shield size={10} color="#22c55e" />
            <Text className="text-green-400 text-xs ml-1 font-semibold">Verified</Text>
          </View>
        </View>

        {/* QR Code + Info Row */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setModalVisible(true)}
          className="px-4 py-4 flex-row items-center"
        >
          {/* QR Thumbnail */}
          <View
            className="p-2 rounded-xl mr-4"
            style={{ backgroundColor: '#ffffff' }}
          >
            <QRCode
              value={qrPayload}
              size={88}
              backgroundColor="#ffffff"
              color="#0b1220"
            />
          </View>

          {/* Resident Info */}
          <View className="flex-1">
            <Text className="text-white text-sm font-bold leading-tight" numberOfLines={2}>
              {residentData.name}
            </Text>
            <Text className="text-slate-400 text-xs mt-1">
              Bgry. {residentData.barangay}
            </Text>
            <Text className="text-slate-400 text-xs">
              Purok {residentData.purok}
            </Text>
            {residentData.philhealthNo && (
              <Text className="text-cyan-400 text-xs mt-1.5 font-medium">
                PhilHealth: {residentData.philhealthNo}
              </Text>
            )}
            <Text
              className="text-orange-400 text-xs mt-2 font-semibold"
              style={{ letterSpacing: 0.3 }}
            >
              Tap to enlarge →
            </Text>
          </View>
        </TouchableOpacity>

        {/* Expandable Details */}
        <TouchableOpacity
          onPress={() => setShowDetails((v) => !v)}
          activeOpacity={0.7}
          className="px-4 pb-3 flex-row items-center"
          style={{ borderTopWidth: 1, borderTopColor: 'rgba(100, 116, 139, 0.15)', paddingTop: 10 }}
        >
          <Text className="text-slate-400 text-xs flex-1">
            {showDetails ? 'Hide profile details' : 'Show profile details'}
          </Text>
          {showDetails ? (
            <ChevronUp size={14} color="#94a3b8" />
          ) : (
            <ChevronDown size={14} color="#94a3b8" />
          )}
        </TouchableOpacity>

        {showDetails && (
          <View className="px-4 pb-4">
            <FieldRow label="Full Name" value={residentData.name} />
            <FieldRow label="Barangay" value={residentData.barangay} />
            <FieldRow label="Purok" value={residentData.purok} />
            <FieldRow label="Sex" value={residentData.sex} />
            <FieldRow
              label="Birthdate"
              value={
                residentData.birthDate
                  ? new Date(residentData.birthDate).toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : undefined
              }
            />
            <FieldRow label="Contact" value={residentData.contactNumber} />
            <FieldRow label="PhilHealth No." value={residentData.philhealthNo} />
            <View className="mt-3 p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)' }}>
              <Text className="text-green-400 text-xs text-center">
                🔒 Only authorized health workers can scan this QR code
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Full-Screen Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent
      >
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
        >
          <View
            className="mx-6 rounded-3xl overflow-hidden w-full"
            style={{
              backgroundColor: '#131c2e',
              borderWidth: 1,
              borderColor: 'rgba(249, 115, 22, 0.3)',
              maxWidth: 380,
            }}
          >
            {/* Modal Header */}
            <View
              className="px-5 pt-5 pb-4 flex-row items-center"
              style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(100, 116, 139, 0.2)' }}
            >
              <View className="flex-1">
                <Text className="text-white text-base font-bold">My Health QR Code</Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Show this to an authorized health worker
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="w-9 h-9 rounded-xl items-center justify-center"
                style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}
              >
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }}>
              {/* Large QR Code */}
              <View
                className="p-4 rounded-2xl mb-5"
                style={{ backgroundColor: '#ffffff', shadowColor: '#f97316', shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 }}
              >
                <QRCode
                  value={qrPayload}
                  size={220}
                  backgroundColor="#ffffff"
                  color="#0b1220"
                  quietZone={8}
                />
              </View>

              {/* Resident Name Badge */}
              <View className="items-center mb-4">
                <Text className="text-white text-lg font-bold text-center leading-tight">
                  {residentData.name}
                </Text>
                <Text className="text-slate-400 text-sm mt-1 text-center">
                  Bgry. {residentData.barangay}, Purok {residentData.purok}
                </Text>
                {residentData.philhealthNo && (
                  <View
                    className="mt-2 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)' }}
                  >
                    <Text className="text-cyan-400 text-xs font-semibold">
                      PhilHealth: {residentData.philhealthNo}
                    </Text>
                  </View>
                )}
              </View>

              {/* Resident ID */}
              <View
                className="w-full px-4 py-3 rounded-xl mb-4"
                style={{ backgroundColor: 'rgba(249, 115, 22, 0.08)', borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.2)' }}
              >
                <Text className="text-slate-400 text-xs text-center mb-1">Resident ID</Text>
                <Text
                  className="text-orange-400 text-xs text-center font-mono"
                  selectable
                >
                  {residentData.residentId}
                </Text>
              </View>

              {/* Security Notice */}
              <View
                className="w-full flex-row items-start p-3 rounded-xl mb-4"
                style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)' }}
              >
                <Shield size={14} color="#22c55e" style={{ marginTop: 1, marginRight: 8 }} />
                <Text className="text-green-400 text-xs flex-1 leading-relaxed">
                  This QR code is uniquely linked to your NagaCare profile. Only authorized Naga City Health Workers can access your records when scanning.
                </Text>
              </View>

              {/* Share Button */}
              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={0.8}
                className="w-full py-3.5 rounded-2xl flex-row items-center justify-center"
                style={{ backgroundColor: 'rgba(249, 115, 22, 0.15)', borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.3)' }}
              >
                <Share2 size={16} color="#f97316" />
                <Text className="text-orange-400 font-semibold ml-2">Share Health ID</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default QRCodeCard;
