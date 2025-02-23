import React from 'react';
import { Menu, LogOut, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function FloatingMenu() {
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-sm shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <svg 
              width="120" 
              height="24" 
              viewBox="0 0 1932 384" 
              className="fill-white"
            >
              <path d="M161.5 47.5C213.495 42.6018 256.995 59.2685 292 97.5C294.167 100.5 296.333 103.5 298.5 106.5C280.909 118.878 263.075 130.878 245 142.5C216.455 106.24 181.288 98.0733 139.5 118C112.613 136.597 98.9465 162.43 98.5 195.5C98.9465 228.57 112.613 254.403 139.5 273C161.27 284.66 183.936 286.66 207.5 279C223.173 272.014 235.84 261.514 245.5 247.5C264.195 258.176 282.529 269.343 300.5 281C274.874 316.493 240.207 337.16 196.5 343C132.52 347.428 83.6862 322.595 50 268.5C30.743 233.03 26.0763 195.696 36 156.5C56.0721 94.9172 97.9054 58.5839 161.5 47.5Z"/>
              <path d="M357.5 55.5H421.5V167.5H523.5V55.5H587.5V335.5H523.5V223.5H421.5V335.5H357.5V55.5Z"/>
              <path d="M738.5 55.5C763.408 55.1722 788.241 55.5055 813 56.5C844.204 149.278 875.704 241.945 907.5 334.5H841.5C836.425 319.609 831.758 304.609 827.5 289.5H724.5C719.608 304.843 714.608 319.676 709.5 334.5C687.844 335.5 666.177 335.833 644.5 335.5C675.238 241.952 706.572 148.618 738.5 55.5ZM775.5 130.5C787.072 164.553 798.072 198.887 808.5 233.5H742.5C753.51 198.472 764.51 164.472 775.5 130.5Z"/>
              <path d="M1033.5 55.5C1058.41 55.1722 1083.24 55.5055 1108 56.5C1139.2 149.278 1170.7 241.945 1202.5 334.5H1136.5C1131.42 319.609 1126.76 304.609 1122.5 289.5H1019.5C1014.61 304.843 1009.61 319.676 1004.5 334.5C982.844 335.5 961.177 335.833 939.5 335.5C970.238 241.952 1001.57 148.618 1033.5 55.5ZM1070.5 130.5C1082.07 164.553 1093.07 198.887 1103.5 233.5H1037.5C1048.51 198.472 1059.51 164.472 1070.5 130.5Z"/>
              <path d="M1258.5 55.5H1322.5V158.5C1349.38 124.243 1375.88 90.0763 1402.5 56C1425.84 55.1669 1449.17 55.3335 1472.5 56.5C1437.36 102.143 1402.02 147.643 1366.5 193C1407.28 240.073 1447.95 287.24 1488.5 334.5C1461.84 335.667 1435.17 335.833 1408.5 335C1380 301.833 1351.5 268.667 1323 235.5V335.5H1258.5V55.5Z"/>
              <path d="M1545.5 55.5C1589.5 55.3333 1633.5 55.5 1677.5 56C1722.7 65.2047 1749.87 92.3714 1759 137.5C1763.49 179.006 1748.66 211.506 1714.5 235C1709.29 238.103 1703.96 240.936 1698.5 243.5C1723.94 274.441 1749.94 304.941 1776.5 335H1696.5C1672.17 306.667 1647.83 278.333 1623.5 250C1618.85 249.501 1614.18 249.334 1609.5 249.5V335.5H1545.5V55.5ZM1609.5 111.5H1652.5C1676.5 114.663 1689.83 127.996 1692.5 152C1691.22 173.899 1679.89 187.232 1658.5 192H1609.5V111.5Z"/>
              <path d="M1828.5 55.5H1892.5V335.5H1828.5V55.5Z"/>
            </svg>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-white/80" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <FileText className="w-6 h-6 text-white/80" />
            </button>
            <button 
              onClick={handleSignOut}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-6 h-6 text-white/80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}