import { supabase } from '../../lib/supabase';

export const storageApi = {
    /**
     * Upload payment proof to storage
     */
    async uploadPaymentProof(userId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('payment-proofs')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error details:', uploadError);
            throw new Error('Gagal mengupload bukti pembayaran. Pastikan bucket "payment-proofs" tersedia.');
        }

        const { data: { publicUrl } } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    /**
     * Upload course material
     */
    async uploadMaterial(courseId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${courseId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('course-materials')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('course-materials')
            .getPublicUrl(filePath);

        return publicUrl;
    }
};
