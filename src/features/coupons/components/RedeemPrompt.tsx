import { Link } from 'react-router-dom';
import { PartyPopper, ThumbsUp, ThumbsDown, LogIn } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useVoteCouponMutation } from '@/api/couponApi';
import { useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/ui/toast';

export function RedeemPrompt({
  couponId, open, onClose,
}: { couponId: string; open: boolean; onClose: () => void }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [vote, { isLoading }] = useVoteCouponMutation();
  const toast = useToast();

  const handleVote = async (voteType: 'WORKING' | 'EXPIRED') => {
    try {
      await vote({ id: couponId, voteType }).unwrap();
      toast.show('Thanks — that helps other shoppers!', 'success');
    } catch {
      toast.show('Could not record your vote (maybe you already voted?)', 'error');
    } finally {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-dark">
          <PartyPopper size={22} />
        </span>
        <h3 className="font-display text-lg text-ink">Code copied!</h3>

        {isAuthenticated ? (
          <>
            <p className="mt-1 text-sm text-ink-soft">
              Once you've used it, let others know it worked — it helps the whole community.
            </p>
            <div className="mt-4 flex w-full gap-2">
              <button disabled={isLoading} onClick={() => handleVote('WORKING')} className="btn-primary flex-1 py-2 text-sm">
                <ThumbsUp size={14} /> It worked
              </button>
              <button disabled={isLoading} onClick={() => handleVote('EXPIRED')} className="btn-secondary flex-1 py-2 text-sm">
                <ThumbsDown size={14} /> Didn't work
              </button>
            </div>
            <button onClick={onClose} className="btn-ghost mt-2 text-xs">I'll do it later</button>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-soft">
              Log in to mark this coupon as redeemed once you've used it — it helps other shoppers know it's still valid.
            </p>
            <Link to="/login" onClick={onClose} className="btn-primary mt-4 w-full py-2 text-sm">
              <LogIn size={14} /> Log in to help others
            </Link>
            <button onClick={onClose} className="btn-ghost mt-2 text-xs">Maybe later</button>
          </>
        )}
      </div>
    </Modal>
  );
}
