export enum ConstructionDiaryDetailTypeEnum {
  MATERIAL = 'MATERIAL', // Vật liệu
  EQUIPMENT = 'EQUIPMENT', // Thiết bị
  LABOR = 'LABOR', // Nhân lực
}

export const CONSTRUCTION_DIARY_DETAIL_TYPE_OPTIONS = [
  {
    value: ConstructionDiaryDetailTypeEnum.MATERIAL,
    label: 'Vật liệu',
  },
  {
    value: ConstructionDiaryDetailTypeEnum.EQUIPMENT,
    label: 'Thiết bị',
  },
  {
    value: ConstructionDiaryDetailTypeEnum.LABOR,
    label: 'Nhân lực',
  },
];
