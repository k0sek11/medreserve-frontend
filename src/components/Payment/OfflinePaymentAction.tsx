import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmOfflinePayment }   from '../../api/paymentApi'; 

interface Props {
  paymentId: number;
}

export const OfflinePaymentAction = ({ paymentId }: Props) => {
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const confirmMutation = useMutation({
    mutationFn: confirmOfflinePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-appointment-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['appointmentDetails'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setComment(''); 
    },
    onError: (error) => {
      console.error("Błąd podczas zatwierdzania płatności offline:", error);
      alert("Nie udało się zatwierdzić płatności.");
    }
  });

  return (
    <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', marginTop: '15px', backgroundColor: '#f9f9f9' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Zatwierdź płatność w placówce</h3>
      <p style={{ fontSize: '14px', color: '#555' }}>Użyj tego przycisku, gdy pacjent uregulował należność gotówką lub kartą na miejscu.</p>
      
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Komentarz (opcjonalnie):</label>
        <input 
          type="text" 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Np. zapłacono odliczoną gotówką..."
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          disabled={confirmMutation.isPending}
        />
      </div>

      <button 
        onClick={() => confirmMutation.mutate({ paymentId, comment })} 
        disabled={confirmMutation.isPending}
        style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {confirmMutation.isPending ? 'Zatwierdzanie...' : 'Potwierdzam otrzymanie wpłaty'}
      </button>

      {confirmMutation.isSuccess && (
        <p style={{ color: 'green', margin: '10px 0 0 0' }}>✅ Płatność została zaksięgowana w bazie.</p>
      )}
    </div>
  );
};