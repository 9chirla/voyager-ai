import CountryFlag from '../CountryFlag';
import { getPassportByIso } from '../../data/passportData';
import { lookupVisaNotes } from '../../data/visaCosts';
import {
  getVisaAccessVia,
  getVisaBreakdown,
  getVisaStatus,
  VISA_STATUS_META,
} from '../../hooks/useVisaStatus';

/**
 * @param {{
 *   destinationIso: string,
 *   passports: string[],
 *   heldVisas?: string[],
 * }} props
 */
export default function VisaDetailPanel({ destinationIso, passports, heldVisas = [] }) {
  const combined = getVisaStatus(passports, destinationIso, heldVisas);
  const combinedMeta = VISA_STATUS_META[combined];
  const accessVia = getVisaAccessVia(passports, heldVisas, destinationIso);
  const breakdown = getVisaBreakdown(passports, destinationIso, heldVisas);
  const notes = lookupVisaNotes(destinationIso);

  return (
    <div className="dest-visa-detail">
      <div className="dest-visa-detail__summary">
        <span className={`dest-visa-pill ${combinedMeta.className}`}>
          {combinedMeta.label}
        </span>
        <p className="dest-visa-detail__desc">{combinedMeta.description}</p>
        {accessVia && (
          <p className="dest-visa-detail__via">
            Access improved
            {' '}
            {accessVia}
          </p>
        )}
      </div>

      {breakdown.length > 0 && (
        <ul className="dest-visa-detail__breakdown">
          {breakdown.map(({ iso, status, cost, processing, withoutHeldVisa }) => {
            const passport = getPassportByIso(iso);
            const meta = VISA_STATUS_META[status];
            const aloneMeta = withoutHeldVisa
              ? VISA_STATUS_META[withoutHeldVisa.status]
              : null;
            return (
              <li key={iso} className="dest-visa-detail__row">
                <div className="dest-visa-detail__passport">
                  <CountryFlag iso={iso} className="country-flag--chip" />
                  <span>{passport?.label ?? iso}</span>
                </div>
                <span className={`dest-visa-pill dest-visa-pill--compact ${meta.className}`}>
                  {meta.label}
                </span>
                {(cost || processing) && (
                  <span className="dest-visa-detail__cost">
                    {cost && <span>{cost}</span>}
                    {cost && processing && ' · '}
                    {processing && <span>{processing}</span>}
                  </span>
                )}
                {withoutHeldVisa && aloneMeta && (
                  <span className="dest-visa-detail__alone">
                    Passport alone:
                    {' '}
                    {aloneMeta.label}
                    {(withoutHeldVisa.cost || withoutHeldVisa.processing) && (
                      <>
                        {' '}
                        (
                        {withoutHeldVisa.cost}
                        {withoutHeldVisa.cost && withoutHeldVisa.processing && ' · '}
                        {withoutHeldVisa.processing}
                        )
                      </>
                    )}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {notes && (
        <p className="dest-visa-detail__notes">{notes}</p>
      )}
    </div>
  );
}
