import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, ShieldCheck, ShieldX, Pencil, Trash2, Star, MapPin, Calendar, Armchair, PackageX, RotateCcw, Inbox, Download } from 'lucide-react';
import {
  useGetCouponByIdQuery,
  useVoteCouponMutation,
  useCopyCouponCodeMutation,
  useApproveCouponMutation,
  useRejectCouponMutation,
  useDeleteCouponMutation,
  useMarkCouponSoldOutMutation,
  useRelistCouponMutation,
} from '@/api/couponApi';
import { useAppSelector } from '@/app/hooks';
import { useToast } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { usePrompt } from '@/components/ui/PromptDialog';
import { formatCurrency, formatDate, formatDateTime, COUPON_TYPE_LABELS, TICKET_CATEGORY_LABELS } from '@/lib/format';
import { CouponCodeChip } from '@/components/ui/CouponCodeChip';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { DetailSkeleton } from '@/components/ui/PageSkeletons';
import { EmptyState } from '@/components/ui/EmptyState';
import { RequestDealButton } from './components/RequestDealButton';
import { RequestPanel } from './components/RequestPanel';
import { RedeemPrompt } from './components/RedeemPrompt';

export default function CouponDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const promptFn = usePrompt();
  const user = useAppSelector((s) => s.auth.user);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { data, isLoading, error } = useGetCouponByIdQuery(id!, { skip: !id });
  const [vote, { isLoading: voting }] = useVoteCouponMutation();
  const [copyCode] = useCopyCouponCodeMutation();
  const [approve, { isLoading: approving }] = useApproveCouponMutation();
  const [reject, { isLoading: rejecting }] = useRejectCouponMutation();
  const [deleteCoupon, { isLoading: deleting }] = useDeleteCouponMutation();
  const [markSoldOut, { isLoading: markingSoldOut }] = useMarkCouponSoldOutMutation();
  const [relist, { isLoading: relisting }] = useRelistCouponMutation();
  const [showRedeemPrompt, setShowRedeemPrompt] = useState(false);

  if (isLoading) return <DetailSkeleton />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState title="Coupon not found" description="It may have expired, been removed, or the link is incorrect." />
      </div>
    );
  }

  const coupon = data.data;
  const isOwner = user?.id === coupon.seller.id;
  const isModerator = user?.roles.some((r) => ['ROLE_MODERATOR', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(r));
  const totalVotes = coupon.workingVotes + coupon.expiredVotes;
  const isTicket = coupon.type === 'EVENT_TICKET';
  const feeApplies = coupon.platformFeeAmount > 0;
  const isSoldOut = coupon.status === 'SOLD_OUT' || coupon.availableQuantity - coupon.soldQuantity <= 0;
  const canRequest = isAuthenticated && !isOwner && !isSoldOut && coupon.type !== 'FREE' && coupon.status === 'ACTIVE';
  const needsLoginToRequest = !isAuthenticated && !isSoldOut && coupon.type !== 'FREE' && coupon.status === 'ACTIVE';

  const handleMarkSoldOut = async () => {
    const ok = await confirm({
      title: 'Mark as sold out?',
      description: 'It will be hidden from active browsing but still visible on your dashboard.',
      confirmLabel: 'Mark sold out',
    });
    if (!ok) return;
    try {
      await markSoldOut(coupon.id).unwrap();
      toast.show('Marked as sold out', 'success');
    } catch {
      toast.show('Could not update coupon', 'error');
    }
  };

  const handleRelist = async () => {
    try {
      await relist(coupon.id).unwrap();
      toast.show('Coupon relisted as active', 'success');
    } catch {
      toast.show('Could not relist coupon', 'error');
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete this coupon?',
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteCoupon(coupon.id).unwrap();
      toast.show('Coupon deleted', 'success');
      navigate('/dashboard');
    } catch {
      toast.show('Could not delete coupon', 'error');
    }
  };

  const handleReject = async () => {
    const reason = await promptFn({
      title: 'Reject this coupon',
      placeholder: 'Reason for rejecting…',
      confirmLabel: 'Reject',
      required: true,
    });
    if (!reason) return;
    try {
      await reject({ id: coupon.id, reason }).unwrap();
      toast.show('Coupon rejected', 'success');
    } catch {
      toast.show('Could not reject coupon', 'error');
    }
  };

  const handleApprove = async () => {
    try {
      await approve(coupon.id).unwrap();
      toast.show('Coupon approved and now live', 'success');
    } catch {
      toast.show('Could not approve coupon', 'error');
    }
  };

  const handleVote = async (voteType: 'WORKING' | 'EXPIRED') => {
    try {
      await vote({ id: coupon.id, voteType }).unwrap();
      toast.show('Thanks for confirming!', 'success');
    } catch {
      toast.show('Could not record your vote (maybe you already voted?)', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="ticket-card overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link to={`/coupons?brandId=${coupon.brand.id}`} className="text-sm font-semibold uppercase tracking-wide text-brand hover:underline">
                {coupon.brand.name}
              </Link>
              <h1 className="mt-1 font-display text-2xl text-ink sm:text-3xl">{coupon.title}</h1>
            </div>
            <Badge variant="stamp">
              {isTicket && coupon.ticketCategory ? TICKET_CATEGORY_LABELS[coupon.ticketCategory] : COUPON_TYPE_LABELS[coupon.type]}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="neutral">{coupon.category.name}</Badge>
            <Badge variant={coupon.status === 'ACTIVE' ? 'brand' : 'neutral'}>{coupon.status.replace('_', ' ')}</Badge>
            {coupon.verifiedWorking && <Badge variant="brand">✓ Verified working</Badge>}
            {isSoldOut && <Badge variant="danger">Sold out / redeemed</Badge>}
          </div>

          {isSoldOut && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 flex items-center gap-2 rounded-xl bg-line/30 px-4 py-3 text-sm text-ink-soft"
            >
              <PackageX size={16} /> This deal has been fully claimed and is no longer available.
            </motion.div>
          )}

          {coupon.description && <p className="mt-5 text-ink-soft">{coupon.description}</p>}

          {isTicket && (
            <div className="mt-5 grid grid-cols-1 gap-3 rounded-xl bg-brand-light/30 p-4 sm:grid-cols-3">
              {coupon.venueName && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
                  <span>{coupon.venueName}{coupon.venueCity ? `, ${coupon.venueCity}` : ''}</span>
                </div>
              )}
              {coupon.eventDateTime && (
                <div className="flex items-start gap-2 text-sm">
                  <Calendar size={16} className="mt-0.5 shrink-0 text-brand" />
                  <span>{formatDateTime(coupon.eventDateTime)}</span>
                </div>
              )}
              {coupon.seatDetails && (
                <div className="flex items-start gap-2 text-sm">
                  <Armchair size={16} className="mt-0.5 shrink-0 text-brand" />
                  <span>{coupon.seatDetails}</span>
                </div>
              )}
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-4 font-mono text-sm sm:grid-cols-3">
            {coupon.originalValue !== undefined && (
              <div><dt className="text-ink-soft">Value</dt><dd className="font-semibold">{formatCurrency(coupon.originalValue)}</dd></div>
            )}
            {coupon.discountPercentage !== undefined && (
              <div><dt className="text-ink-soft">Discount</dt><dd className="font-semibold">{coupon.discountPercentage}%</dd></div>
            )}
            {coupon.minOrderValue !== undefined && (
              <div><dt className="text-ink-soft">Min. order</dt><dd className="font-semibold">{formatCurrency(coupon.minOrderValue)}</dd></div>
            )}
            <div><dt className="text-ink-soft">Available</dt><dd className="font-semibold">{coupon.availableQuantity - coupon.soldQuantity} left</dd></div>
            {coupon.expiryDate && !isTicket && (
              <div><dt className="text-ink-soft">Expires</dt><dd className="font-semibold">{formatDate(coupon.expiryDate)}</dd></div>
            )}
            <div><dt className="text-ink-soft">Views</dt><dd className="font-semibold">{coupon.viewCount}</dd></div>
          </dl>
        </div>

        <div className="tear-line mx-6 sm:mx-8" />

        <div className="p-6 sm:p-8">
          <p className="label-text">{isTicket ? 'Ticket / booking code' : 'Coupon code'}</p>
          <CouponCodeChip code={coupon.couponCode} onCopy={() => {
            copyCode(coupon.id);
            if (coupon.type === 'FREE') setShowRedeemPrompt(true);
            else toast.show('Code copied to clipboard', 'success');
          }} />
          <RedeemPrompt couponId={coupon.id} open={showRedeemPrompt} onClose={() => setShowRedeemPrompt(false)} />

          {isTicket && (coupon.imageUrls ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(coupon.imageUrls ?? []).map((url) => (
                <a key={url} href={url} download target="_blank" rel="noreferrer" className="btn-secondary py-1.5 text-sm">
                  <Download size={14} /> Download ticket
                </a>
              ))}
            </div>
          )}
          {isTicket && coupon.couponCode.includes('*') && (
            <p className="mt-2 text-xs text-ink-soft">
              The ticket image unlocks here too, right after your payment is verified.
            </p>
          )}

          {coupon.couponCode.includes('*') && (
            <p className="mt-2 text-xs text-ink-soft">
              This code is hidden until payment is verified — request the deal below, and it unlocks automatically once the platform confirms your payment.
            </p>
          )}

          {canRequest && (
            <div className="mt-4">
              <RequestDealButton couponId={coupon.id} sellingPrice={coupon.sellingPrice} />
            </div>
          )}

          {needsLoginToRequest && (
            <div className="mt-4 rounded-xl border-2 border-dashed border-brand bg-brand-light/30 p-4 text-center">
              <p className="text-sm text-ink-soft">Log in to request this deal from the seller.</p>
              <Link to="/login" state={{ from: { pathname: `/coupons/${coupon.id}` } }} className="btn-primary mt-3 inline-flex text-sm">
                Log in to request
              </Link>
            </div>
          )}

          {feeApplies && (
            <div className="mt-4 rounded-xl bg-line/20 p-4 font-mono text-sm">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-ink-soft">Price breakdown</p>
              <div className="flex justify-between"><span>Price</span><span>{formatCurrency(coupon.sellingPrice)}</span></div>
              <div className="flex justify-between text-ink-soft"><span>Platform fee ({coupon.platformFeePercentage}%)</span><span>{formatCurrency(coupon.platformFeeAmount)}</span></div>
              {isOwner && (
                <div className="mt-1 flex justify-between border-t border-dashed border-line pt-1 font-semibold text-brand-dark">
                  <span>You receive</span><span>{formatCurrency(coupon.sellerReceivableAmount)}</span>
                </div>
              )}
            </div>
          )}

          {coupon.termsConditions && (
            <details className="mt-4 text-sm text-ink-soft">
              <summary className="cursor-pointer font-semibold text-ink">Terms &amp; conditions</summary>
              <p className="mt-2">{coupon.termsConditions}</p>
            </details>
          )}

          {coupon.type === 'FREE' && (
            <div className="mt-6 rounded-xl bg-brand-light/40 p-4">
              <p className="text-sm font-semibold text-ink">Does this code still work?</p>
              <div className="mt-2 flex items-center gap-3">
                <motion.button whileTap={{ scale: 0.95 }} disabled={voting} onClick={() => handleVote('WORKING')} className="btn-secondary py-1.5 text-sm">
                  <ThumbsUp size={14} /> Working ({coupon.workingVotes})
                </motion.button>
                <motion.button whileTap={{ scale: 0.95 }} disabled={voting} onClick={() => handleVote('EXPIRED')} className="btn-secondary py-1.5 text-sm">
                  <ThumbsDown size={14} /> Expired ({coupon.expiredVotes})
                </motion.button>
              </div>
              {totalVotes > 0 && (
                <p className="mt-2 text-xs text-ink-soft">{totalVotes} vote{totalVotes === 1 ? '' : 's'} so far</p>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between rounded-xl border border-line/60 p-4">
            <div>
              <p className="text-xs text-ink-soft">Listed by</p>
              <p className="font-semibold text-ink">{coupon.seller.fullName}</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-ink-soft">
              <Star size={14} className="fill-stamp text-stamp" />
              {coupon.seller.averageRating?.toFixed(1) ?? 'New'} ({coupon.seller.reviewCount ?? 0} reviews)
            </div>
          </div>

          {isOwner && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/coupons/${coupon.id}/edit`} className="btn-secondary text-sm"><Pencil size={14} /> Edit</Link>
              {isSoldOut ? (
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleRelist} disabled={relisting} className="btn-secondary text-sm">
                  <RotateCcw size={14} /> Relist as active
                </motion.button>
              ) : (
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleMarkSoldOut} disabled={markingSoldOut} className="btn-secondary text-sm">
                  <PackageX size={14} /> Mark sold out
                </motion.button>
              )}
              <button onClick={handleDelete} disabled={deleting} className="btn-secondary text-sm text-stamp-dark border-stamp-dark hover:bg-stamp-dark hover:text-white">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}

          {isOwner && coupon.type !== 'FREE' && (
            <div className="mt-6 rounded-xl border-2 border-line/70 p-4">
              <p className="mb-3 flex items-center gap-2 font-display text-base text-ink">
                <Inbox size={18} /> Requests on this coupon
              </p>
              <RequestPanel couponId={coupon.id} />
            </div>
          )}

          {isModerator && coupon.status === 'PENDING_REVIEW' && (
            <div className="mt-6 flex flex-wrap gap-3 rounded-xl border-2 border-dashed border-stamp p-4">
              <p className="w-full text-sm font-semibold text-ink">Moderation</p>
              <button onClick={handleApprove} disabled={approving} className="btn-primary text-sm">
                <ShieldCheck size={14} /> Approve
              </button>
              <button onClick={handleReject} disabled={rejecting} className="btn-secondary text-sm">
                <ShieldX size={14} /> Reject
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
