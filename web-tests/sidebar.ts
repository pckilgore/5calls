import { ClientFunction, t, Selector } from 'testcafe';
import { waitForReact, ReactSelector } from 'testcafe-react-selectors';

const getWindowLocation = ClientFunction(() => window.location.href);

fixture`Sidebar`.page`http://localhost:3000`.beforeEach(async () => {
  await waitForReact(15000);
});

// tslint:disable-next-line:no-shadowed-variable
test('Sidebar Header exists and user may set location', async t => {
  const sidebarComponent = await Selector('.issues__header');
  await t.expect(sidebarComponent.exists).ok();

  const Location = await ReactSelector('Location');
  await t.expect(Location).ok('Location component is not displayed');

  const setLocationMessage = await Selector('#setLocationMessage');
  await t
    .expect(setLocationMessage.exists)
    .ok('Set location message is not displayed');

  let locationSetMessage = await Selector('#locationMessage').withText(
    'Set your location'
  );

  if (await locationSetMessage.exists) {
    const locationButton = await Location.findReact('button');
    await t.expect(locationButton.innerText).eql('CHANGE LOCATION');
    await t.click(locationButton);

    const addressField = Selector('#address');
    await t
      .expect(addressField.getAttribute('placeholder'))
      .eql('Enter an address or zip code');
    const submitButton = Location.findReact('button');
    await t.expect(submitButton.innerText).eql('GO');

    await t
      .typeText(addressField, '80123')
      .expect(addressField.value)
      .eql('80123');
    await t.click(submitButton);

    locationSetMessage = await Selector('#locationMessage').withText(
      'Your location: '
    );
    await t
      .expect(locationSetMessage.innerText)
      .eql('Your location: Littleton');
  }
});

// tslint:disable-next-line:no-shadowed-variable
test('Sidebar body contains a list of issues and a footer to more issues', async t => {
  const Sidebar = await ReactSelector('Sidebar');
  await t.expect(Sidebar).ok('Sidebar is displayed on the page');

  const IssueItems = await Sidebar.findReact('li');
  const count = await IssueItems.count;
  // There will be at least one item, the footer link
  await t.expect(count).gte(1);

  for (let i = 0; i < count; i++) {
    const Issue = IssueItems.nth(i);
    const Link = await Issue.findReact('a');
    const url = await Link.getAttribute('href');

    // ensure last item links to /more
    if (i === count - 1) {
      await t.expect(url).eql('/more');
    }
  }
});
