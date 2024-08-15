import { List, DateInput, useListContext } from 'react-admin';
import ChartsContainer from './ChartsContainer';

const DashboardFilters = [
  <DateInput key="startDate" source="startDate" alwaysOn />,
  <DateInput key="endDate" source="endDate" alwaysOn />,
];

export const DashboardList = () => (
  <List
    filters={DashboardFilters}
    perPage={100}
    pagination={false}
    component="div"
  >
    <DashboardContent />
  </List>
);

const DashboardContent = () => {
  const { isLoading } = useListContext();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ChartsContainer />
    </div>
  );
};

export default DashboardList;