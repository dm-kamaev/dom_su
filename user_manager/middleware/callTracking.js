'use strict';

async function callTracking(ctx, next) {
  const user = ctx.state.pancakeUser;
  console.log('callTracking => user.checkTrackNeed ===', user.checkTrackNeed());
  if (user.checkTrackNeed()) {
    user.setTrackWaiting(true);
    await user.set_track_number_for_client();
    await user.set_track_number_for_applicant();
  } else {
    user.setTrackWaiting(false);
  }
  await next();
}

module.exports = {
  callTracking
};