import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

/**
 * Arıza fotoğrafını backend'e yükler ve Gemini AI analizini başlatır.
 * @param {string} imageUri - Fotoğrafın yerel URI'si (expo-image-picker'dan gelen)
 * @returns {Promise<Object>} - Backend'den dönen { fault, steps } verisi
 */
export async function uploadFault(imageUri) {
  try {
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    const response = await axios.post(
      `${API_BASE_URL}/api/faults`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data?.error || 'Sunucu hatası oluştu.'
      );
    } else if (error.request) {
      throw new Error(
        'Sunucuya bağlanılamadı. Lütfen IP adresini ve backend sunucusunun çalıştığını kontrol edin.'
      );
    } else {
      throw new Error(error.message || 'Beklenmeyen bir hata oluştu.');
    }
  }
}

/**
 * Belirli bir arızaya ait onarım adımlarını backend'den çeker.
 * @param {number} faultId - Arıza kaydının ID'si
 * @returns {Promise<Array>} - Adımlar dizisi [{ id, fault_id, step_order, coord_x, coord_y, description }]
 */
export async function getSteps(faultId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/faults/${faultId}/steps`,
      { timeout: 15000 }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data?.error || 'Adımlar alınırken sunucu hatası oluştu.'
      );
    } else if (error.request) {
      throw new Error(
        'Sunucuya bağlanılamadı. Lütfen backend sunucusunun çalıştığını kontrol edin.'
      );
    } else {
      throw new Error(error.message || 'Adımlar alınırken beklenmeyen bir hata oluştu.');
    }
  }
}
